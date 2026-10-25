"""Behavioral acceptance of the independently usable API and UI builds."""
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]


class SeparationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.work = Path(self.tmp.name)

    def run_cli(self, *args, cwd=None, ok=True):
        result = subprocess.run(
            [sys.executable, *map(str, args)], cwd=cwd or self.work,
            capture_output=True, text=True,
        )
        if ok:
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        else:
            self.assertNotEqual(result.returncode, 0)
        return result

    def export_backend(self):
        isolated = self.work / 'isolated'
        shutil.copytree(ROOT / 'backend', isolated / 'backend',
                        ignore=shutil.ignore_patterns('__pycache__', 'dist', 'node_modules', 'release'))
        output = self.work / 'api-release'
        self.run_cli('-m', 'backend', 'build', '--output', output, cwd=isolated)
        return isolated, output

    def test_backend_build_needs_no_frontend_and_exports_complete_editorial_data(self):
        self.assertTrue((ROOT / 'backend').is_dir(), 'independent content backend missing')
        isolated, output = self.export_backend()
        catalog = json.loads((output / 'api/v1/catalog.json').read_text())
        self.assertEqual(catalog['schema_version'], '1.0')
        for key in ['cases', 'papers', 'terms', 'relations', 'mechanisms', 'products', 'comparisons']:
            original = json.loads((isolated / 'backend/content' / (key + '.json')).read_text())
            self.assertEqual(catalog[key], original)
        self.assertEqual({o['name'] for o in catalog['organizations']},
                         {c['company'] for c in catalog['cases']})
        self.assertIn('tradeoff', catalog['cases'][0])
        self.assertIn('takeaways', catalog['papers'][0])
        self.assertEqual(
            (output / 'skill/plica-architecture/SKILL.md').read_bytes(),
            (isolated / 'backend/skills/plica-architecture/SKILL.md').read_bytes(),
        )

    def test_existing_public_api_bytes_remain_compatible(self):
        self.assertTrue((ROOT / 'backend').is_dir(), 'independent content backend missing')
        _, output = self.export_backend()
        for relative in ['api/v1/index.json', 'api/v1/terms.json']:
            self.assertEqual((output / relative).read_bytes(), (ROOT / 'site' / relative).read_bytes())

    def test_frontend_build_needs_only_its_source_and_exported_api(self):
        self.assertTrue((ROOT / 'frontend/build.py').is_file(), 'independent UI build missing')
        isolated, api = self.export_backend()
        shutil.rmtree(isolated)
        frontend = self.work / 'frontend'
        shutil.copytree(ROOT / 'frontend', frontend,
                        ignore=shutil.ignore_patterns('__pycache__', 'dist', 'node_modules', 'release'))
        output = self.work / 'ui-release'
        self.run_cli(frontend / 'build.py', '--api-dir', api / 'api/v1', '--output', output)
        self.assertEqual(
            {p.relative_to(output) for p in output.rglob('index.html')},
            {p.relative_to(ROOT / 'site') for p in (ROOT / 'site').rglob('index.html')},
        )
        self.assertFalse((output / 'api').exists(), 'UI must not publish its own API authority')
        for file in output.rglob('*'):
            if file.is_file():
                relative = file.relative_to(output)
                self.assertEqual(file.read_bytes(), (ROOT / 'site' / relative).read_bytes(), str(relative))

    def test_frontend_rejects_unknown_contract_version(self):
        self.assertTrue((ROOT / 'frontend/build.py').is_file(), 'independent UI build missing')
        _, api = self.export_backend()
        path = api / 'api/v1/catalog.json'
        data = json.loads(path.read_text())
        data['schema_version'] = '99.0'
        path.write_text(json.dumps(data))
        result = self.run_cli(ROOT / 'frontend/build.py', '--api-dir', path.parent,
                              '--output', self.work / 'ui-release', ok=False)
        self.assertIn('schema_version', result.stderr)

    def test_frontend_can_link_to_a_separately_hosted_api(self):
        _, api = self.export_backend()
        output = self.work / 'separate-ui'
        self.run_cli(ROOT / 'frontend/build.py', '--api-dir', api / 'api/v1',
                     '--api-base-url', 'http://127.0.0.1:8001', '--output', output)
        html = (output / 'skill/index.html').read_text()
        self.assertIn('href="http://127.0.0.1:8001/api/v1/index.json"', html)
        self.assertIn('href="http://127.0.0.1:8001/skill/plica-architecture/SKILL.md"', html)

    def test_rebuilding_frontend_removes_obsolete_generated_pages(self):
        _, api = self.export_backend()
        output = self.work / 'rebuilt-ui'
        command = (ROOT / 'frontend/build.py', '--api-dir', api / 'api/v1', '--output', output)
        self.run_cli(*command)
        path = api / 'api/v1/catalog.json'
        catalog = json.loads(path.read_text())
        removed = catalog['terms'][-1]
        catalog['terms'].remove(removed)
        catalog['relations'] = [r for r in catalog['relations'] if r['term'] != removed['id']]
        path.write_text(json.dumps(catalog))
        self.run_cli(*command)
        self.assertFalse((output / 'glossary' / removed['id'] / 'index.html').exists(),
                         'removed catalog entry must not stay published by a standalone UI build')

    def test_frontend_rejects_output_overlapping_source_or_input_before_writing(self):
        _, api = self.export_backend()
        frontend = self.work / 'frontend'
        shutil.copytree(ROOT / 'frontend', frontend,
                        ignore=shutil.ignore_patterns('__pycache__', 'dist', 'node_modules', 'release'))
        marker = frontend / 'index.html'
        marker.write_text('authored UI source')
        catalog = api / 'api/v1/catalog.json'
        expected = catalog.read_bytes()
        for output in [frontend, frontend.parent, frontend / 'assets', api, catalog.parent]:
            with self.subTest(output=output):
                self.run_cli(frontend / 'build.py', '--api-dir', catalog.parent,
                             '--output', output, ok=False)
                self.assertTrue(marker.is_file(), 'authored index.html was removed')
                self.assertEqual(marker.read_text(), 'authored UI source')
                self.assertEqual(catalog.read_bytes(), expected)

    def test_taxonomy_strings_are_rendered_as_text(self):
        _, api = self.export_backend()
        path = api / 'api/v1/catalog.json'
        catalog = json.loads(path.read_text())
        label = '<img src=x onerror="alert(1)">'
        english = '<script>alert(2)</script>'
        catalog['mechanisms'][0].update(label=label, english=english)
        path.write_text(json.dumps(catalog))
        output = self.work / 'escaped-ui'
        self.run_cli(ROOT / 'frontend/build.py', '--api-dir', path.parent, '--output', output)
        homepage = (output / 'index.html').read_text()
        self.assertNotIn(label, homepage)
        self.assertNotIn(english, homepage)
        self.assertIn('&lt;img', homepage)
        self.assertIn('&lt;script&gt;', homepage)

    def test_non_ascii_publisher_cannot_export_an_empty_organization_id(self):
        isolated, _ = self.export_backend()
        path = isolated / 'backend/content/cases.json'
        cases = json.loads(path.read_text())
        cases[0]['company'] = '微信团队'
        path.write_text(json.dumps(cases))
        result = self.run_cli('-m', 'backend', 'build', '--output', self.work / 'rejected',
                              cwd=isolated, ok=False)
        self.assertIn('organization id', result.stderr)

    def test_rebuilding_frontend_removes_deleted_source_assets(self):
        _, api = self.export_backend()
        frontend = self.work / 'frontend'
        shutil.copytree(ROOT / 'frontend', frontend,
                        ignore=shutil.ignore_patterns('__pycache__', 'dist', 'node_modules', 'release'))
        asset = frontend / 'assets/retired.svg'
        asset.write_text('<svg/>')
        output = self.work / 'rebuilt-ui'
        command = (frontend / 'build.py', '--api-dir', api / 'api/v1', '--output', output)
        self.run_cli(*command)
        asset.unlink()
        self.run_cli(*command)
        self.assertFalse((output / 'assets/retired.svg').exists())

    def test_invalid_editorial_relations_block_export_without_partial_release(self):
        self.assertTrue((ROOT / 'backend').is_dir(), 'independent content backend missing')
        isolated, _ = self.export_backend()
        path = isolated / 'backend/content/relations.json'
        data = json.loads(path.read_text())
        data[0]['case'] = 'missing-case'
        path.write_text(json.dumps(data))
        output = self.work / 'rejected'
        result = self.run_cli('-m', 'backend', 'build', '--output', output, cwd=isolated, ok=False)
        self.assertIn('dangling relation', result.stderr)
        self.assertFalse(output.exists())

    def test_independent_http_api_supports_separate_origin_ui_and_no_source_or_writes(self):
        self.assertTrue((ROOT / 'backend').is_dir(), 'independent content backend missing')
        isolated, _ = self.export_backend()
        process = subprocess.Popen(
            [sys.executable, '-u', '-m', 'backend', 'serve', '--port', '0',
             '--allow-origin', 'http://localhost:5173'],
            cwd=isolated, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
        )
        try:
            ready = process.stdout.readline().strip()
            self.assertTrue(ready.startswith('Plica public API: '), ready)
            url = ready.removeprefix('Plica public API: ')
            base = url.removesuffix('/api/v1/catalog.json')
            for relative in ['/api/v1/catalog.json', '/api/v1/index.json', '/api/v1/terms.json',
                             '/skill/plica-architecture/SKILL.md']:
                with urlopen(Request(base + relative, headers={'Origin': 'http://localhost:5173'}),
                             timeout=5) as response:
                    self.assertEqual(response.status, 200)
                    self.assertEqual(response.headers['Access-Control-Allow-Origin'], 'http://localhost:5173')
                    self.assertIsNone(response.headers['Access-Control-Allow-Credentials'])
                    self.assertTrue(response.read())
            with urlopen(Request(url, method='OPTIONS'), timeout=5) as response:
                self.assertEqual(response.status, 204)
                self.assertEqual(response.headers['Access-Control-Allow-Methods'], 'GET, HEAD, OPTIONS')
            with urlopen(Request(url, method='HEAD'), timeout=5) as response:
                self.assertEqual(response.status, 200)
                self.assertEqual(response.read(), b'')
            for relative in ['/', '/backend/content/cases.json', '/api/v1/',
                             '/%2e%2e/backend/content/cases.json', '/assets/site.js']:
                with self.assertRaises(HTTPError) as error:
                    urlopen(base + relative, timeout=5)
                self.assertEqual(error.exception.code, 404)
                error.exception.close()
            with self.assertRaises(HTTPError) as error:
                urlopen(Request(url, method='POST', data=b'{}'), timeout=5)
            self.assertEqual(error.exception.code, 501)
            error.exception.close()
        finally:
            process.terminate()
            process.communicate(timeout=5)


if __name__ == '__main__':
    unittest.main()
