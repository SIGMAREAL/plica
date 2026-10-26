"""The deployed React bundle must work with only public release files."""
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import unittest


ROOT = Path(__file__).resolve().parents[1]


class ReactReleaseTests(unittest.TestCase):
    def test_react_release_includes_public_data_routes_and_local_assets(self):
        result = subprocess.run(
            [sys.executable, 'build.py', '--frontend', 'react'], cwd=ROOT,
            env={**os.environ, 'PLICA_REVISION': 'release-test'},
            capture_output=True, text=True,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        release = ROOT / 'frontend/prototype/release'
        self.assertTrue((release / 'release.json').is_file(),
                        'React deployment artifact was not generated')
        self.assertEqual(json.loads((release / 'release.json').read_text())['revision'],
                         'release-test')
        catalog = json.loads((release / 'api/v1/catalog.json').read_text())
        source_products = json.loads((ROOT / 'backend/content/products.json').read_text())
        self.assertEqual({p['id'] for p in catalog['products']},
                         {p['id'] for p in source_products},
                         'The public catalog should export all indexed products')
        self.assertIn('pstack', {p['id'] for p in catalog['products']})
        self.assertIn('lauren-tan-2500-prs', {c['slug'] for c in catalog['cases']})
        self.assertIn('2610.29162', {p['arxiv'] for p in catalog['papers']})
        self.assertEqual((release / 'skill/plica-architecture/SKILL.md').read_bytes(),
                         (ROOT / 'backend/skills/plica-architecture/SKILL.md').read_bytes())
        self.assertFalse((release / 'backend').exists())
        self.assertFalse((release / 'node_modules').exists())
        for route in ['', 'landing/', 'products/', 'cases/dropbox-nucleus-sync/']:
            html = (release / route / 'index.html').read_text()
            self.assertIn('id="root"', html)
            for asset in re.findall(r'(?:src|href)="\./(assets/[^\"]+)"', html):
                self.assertTrue((release / asset).is_file(), asset)
        self.assertIn('<base href="../../"',
                      (release / 'cases/dropbox-nucleus-sync/index.html').read_text())


if __name__ == '__main__':
    unittest.main()
