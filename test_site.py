#!/usr/bin/env python3
"""Real-browser acceptance tests for the generated static site.

Run: python3 -m pip install -r requirements-test.txt
     python3 -m playwright install chromium
     python3 test_site.py

By default a temporary local HTTP server serves the unchanged site at both / and
/plica/, and Chromium tests desktop (1440x900) and mobile (390x844) layouts.
No assets, history methods, or HTML are replaced/inlined. Production has no test
runtime dependency. All generated pages and their local links are checked over
HTTP, in addition to interactive browser navigation.

PLICA_BASE_URL=https://OWNER.github.io/plica/ runs the same suite against a live
site instead. PLICA_BROWSER_PATH overrides browser discovery; otherwise the
Playwright-managed Chromium is preferred, then an installed Chromium/Chrome.
PLICA_TEST_OUTPUT chooses the report/screenshot directory (default: a new system
temporary directory). A failed assertion exits nonzero; JSON summarizes coverage.
"""
from contextlib import contextmanager
from functools import partial
from html.parser import HTMLParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import parse_qs, unquote, urldefrag, urljoin, urlparse
import json
import os
import re
import shutil
import tempfile

try:
    from playwright.sync_api import sync_playwright, expect
except ImportError as exc:
    raise SystemExit("Install test dependencies: python3 -m pip install -r requirements-test.txt") from exc

ROOT = Path(__file__).resolve().parent
SITE = ROOT / 'site'
CASES = json.loads((ROOT / 'cases.json').read_text())
TERMS = json.loads((ROOT / 'terms.json').read_text())
PAPERS = json.loads((ROOT / 'papers.json').read_text())
RELATIONS = json.loads((ROOT / 'relations.json').read_text())
OUTPUT = Path(os.environ.get('PLICA_TEST_OUTPUT') or tempfile.mkdtemp(prefix='plica-tests-'))


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.all = []
        self.h1 = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'h1':
            self.h1 += 1
        field = {'a': 'href', 'link': 'href', 'script': 'src', 'img': 'src'}.get(tag)
        if field and field in attrs:
            self.all.append(attrs[field])


def internal_targets(base):
    """Resolve exactly as the browser does, including the deployment subpath."""
    errors, targets, references = [], set(), 0
    pages = sorted(SITE.rglob('index.html'))
    origin = urlparse(base)
    for file in pages:
        parser = Links()
        parser.feed(file.read_text())
        if parser.h1 != 1:
            errors.append(f'{file.relative_to(ROOT)}: {parser.h1} h1 nodes')
        relative = file.parent.relative_to(SITE).as_posix()
        page_url = urljoin(base, '' if relative == '.' else relative + '/')
        targets.add(page_url)
        for href in parser.all:
            target = urldefrag(urljoin(page_url, href))[0]
            parsed = urlparse(target)
            if parsed.scheme not in ('http', 'https') or parsed.netloc != origin.netloc:
                continue
            references += 1
            if not parsed.path.startswith(origin.path):
                errors.append(f'{file.relative_to(ROOT)}: escapes deployment path: {href}')
                continue
            local = (SITE / unquote(parsed.path[len(origin.path):])).resolve()
            if not local.is_relative_to(SITE):
                errors.append(f'{file.relative_to(ROOT)}: escapes site directory: {href}')
                continue
            if local.is_dir():
                local /= 'index.html'
            if not local.is_file():
                errors.append(f'{file.relative_to(ROOT)}: broken {href}')
            targets.add(target)
    assert not errors, '\n'.join(errors[:30])
    return sorted(targets), {'pages': len(pages), 'internal_links': references, 'broken_links': 0}


@contextmanager
def local_site(mount):
    class Handler(SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def do_GET(self):
            if not urlparse(self.path).path.startswith(mount):
                self.send_error(404, 'Outside site mount')
                return
            super().do_GET()

        def translate_path(self, path):
            # The original URL remains /plica/... in Chromium and its history.
            return super().translate_path('/' + path[len(mount):])

    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(SITE)))
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f'http://127.0.0.1:{server.server_port}{mount}'
    finally:
        server.shutdown()
        server.server_close()
        thread.join()


def launch_browser(playwright):
    explicit = os.environ.get('PLICA_BROWSER_PATH')
    if explicit:
        path = shutil.which(explicit) or explicit
        assert Path(path).is_file(), f'PLICA_BROWSER_PATH does not exist: {explicit}'
    elif Path(playwright.chromium.executable_path).is_file():
        path = playwright.chromium.executable_path
    else:
        path = next((shutil.which(name) for name in
                     ('chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable')
                     if shutil.which(name)), None)
    if not path:
        raise SystemExit('No Chromium found. Run: python3 -m playwright install chromium')
    return playwright.chromium.launch(headless=True, executable_path=path), path


def assert_no_overflow(page):
    dimensions = page.evaluate('''() => ({viewport: innerWidth,
        document: document.documentElement.scrollWidth, body: document.body.scrollWidth})''')
    assert max(dimensions['document'], dimensions['body']) <= dimensions['viewport'], (
        page.url, 'horizontal overflow', dimensions)


def goto(page, base, path=''):
    response = page.goto(urljoin(base, path), wait_until='domcontentloaded')
    assert response and response.ok, (page.url, response.status if response else None)
    expect(page.locator('h1')).to_have_count(1)
    # Ensure external production stylesheet, not an inline substitute, is active.
    expect(page.locator('link[rel="stylesheet"]')).to_have_count(1)
    assert page.evaluate("getComputedStyle(document.querySelector('.header-inner')).display") == 'flex'
    assert_no_overflow(page)


def follow(page, locator, base):
    target = locator.evaluate('(link) => link.href.baseVal === undefined ? link.href : new URL(link.href.baseVal, location.href).href')
    assert target.startswith(base), ('navigation escapes deployment', target)
    locator.click()
    page.wait_for_url(target, wait_until='domcontentloaded')
    expect(page.locator('h1')).to_have_count(1)
    assert_no_overflow(page)
    return target


def assert_query(page, expected):
    assert parse_qs(urlparse(page.url).query) == {key: [value] for key, value in expected.items()}, page.url


def run_viewport(browser, base, label, name, width, height):
    context = browser.new_context(viewport={'width': width, 'height': height},
                                  device_scale_factor=1, is_mobile=name == 'mobile',
                                  has_touch=name == 'mobile', accept_downloads=True)
    page = context.new_page()
    page.set_default_timeout(15000)
    page.set_default_navigation_timeout(30000)
    errors, first_party_errors, external_failures = [], [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('response', lambda response: first_party_errors.append(
        f'{response.status}: {response.url}') if response.url.startswith(base) and response.status >= 400 else None)
    page.on('requestfailed', lambda request: (
        first_party_errors if request.url.startswith(base) else external_failures
    ).append(f'{request.url}: {request.failure}'))
    screenshots = []

    def screenshot(subject):
        path = OUTPUT / f'{label}-{name}-{subject}.png'
        page.screenshot(path=str(path), full_page=True, animations='disabled', timeout=30000)
        screenshots.append(str(path))

    goto(page, base)
    assert 'software' in page.locator('h1').inner_text().lower()
    screenshot('home')
    if name == 'mobile':
        menu = page.locator('.mobile-menu')
        menu.click()
        expect(page.locator('.mobile-nav')).to_be_visible()
        expect(menu).to_have_attribute('aria-expanded', 'true')
        menu.click()
        expect(page.locator('.mobile-nav')).not_to_be_visible()
        menu.click()
        page.keyboard.press('Escape')
        expect(page.locator('.mobile-nav')).not_to_be_visible()
        menu.click()
        follow(page, page.locator('.mobile-nav a[href$="library/"]'), base)
        expect(page.locator('.mobile-nav')).not_to_be_visible()
    else:
        follow(page, page.locator('.hero-actions a[href$="library/"]'), base)

    expect(page.locator('.case-card')).to_have_count(len(CASES))
    assert page.locator('#archive-product option').count() > 10
    dropbox = sum(case['product'] == 'Dropbox' for case in CASES)
    page.locator('#archive-product').select_option('Dropbox')
    expect(page.locator('.case-card:visible')).to_have_count(dropbox)
    assert_query(page, {'product': 'Dropbox'})
    page.locator('#archive-company').select_option('YouTube')
    expect(page.locator('.case-card:visible')).to_have_count(0)
    expect(page.locator('#empty-state')).to_be_visible()
    assert_query(page, {'company': 'YouTube', 'product': 'Dropbox'})
    page.locator('#empty-clear').click()
    expect(page.locator('.case-card:visible')).to_have_count(len(CASES))
    assert_query(page, {})
    page.locator('#archive-category').select_option('storage')
    expect(page.locator('.case-card:visible')).to_have_count(sum(case['category'] == 'storage' for case in CASES))
    assert_query(page, {'system': 'storage'})
    page.locator('#clear-filters').click()
    page.locator('#archive-search').fill('Feature Flag')
    assert page.locator('.case-card:visible').count() >= 1
    assert_query(page, {'q': 'Feature Flag'})
    page.reload(wait_until='domcontentloaded')
    expect(page.locator('#archive-search')).to_have_value('Feature Flag')
    assert page.locator('.case-card:visible').count() >= 1
    page.locator('#clear-filters').click()
    expect(page.locator('.case-card:visible')).to_have_count(len(CASES))
    assert_query(page, {})
    # Deep-link initialization checks all four query controls without mocking history.
    goto(page, base, 'library/?q=Dropbox&system=storage&company=Dropbox&product=Dropbox')
    for selector, value in [('search', 'Dropbox'), ('category', 'storage'),
                            ('company', 'Dropbox'), ('product', 'Dropbox')]:
        expect(page.locator(f'#archive-{selector}')).to_have_value(value)
    expect(page.locator('.case-card:visible')).to_have_count(dropbox)
    library_url = page.url
    follow(page, page.locator('.case-card:visible .case-click').first, base)
    page.go_back(wait_until='domcontentloaded')
    assert page.url == library_url
    expect(page.locator('.case-card:visible')).to_have_count(dropbox)
    assert_no_overflow(page)
    screenshot('library')

    goto(page, base, 'compare/')
    for case_id in ('github-git-agent-scale', 'anthropic-source-control', 'meta-haystack-photos'):
        assert page.locator(f'a[href*="{case_id}/"]').count() >= 1
    goto(page, base, 'cases/spotify-generative-inference/')
    assert page.locator('a[href^="https://engineering.atspotify.com/"]').count() >= 1
    assert '2026.10.16' in page.locator('.case-facts').inner_text()

    goto(page, base, 'graph/')
    graph_count = page.locator('#graph-topic option').count()
    assert graph_count >= 50
    assert page.locator('#knowledge-svg a').count() > 0
    page.locator('#graph-topic').select_option('company:netflix')
    expect(page.locator('#graph-heading')).to_have_text(re.compile(r'^团队 · Netflix'))
    expect(page.locator('#graph-list')).to_be_visible()
    assert page.locator('#graph-list a').count() == page.locator('#knowledge-svg a').count() > 0
    assert_no_overflow(page)
    screenshot('graph')
    follow(page, page.locator('#graph-list a' if name == 'mobile' else '#knowledge-svg a').first, base)
    assert '/cases/' in urlparse(page.url).path

    goto(page, base, 'glossary/')
    expect(page.locator('.glossary-row')).to_have_count(len(TERMS))
    page.locator('#glossary-search').fill('feature flags')
    expect(page.locator('.glossary-row:visible')).to_have_count(1)
    follow(page, page.locator('.glossary-row:visible'), base)
    assert '/glossary/feature-flags/' in page.url
    goto(page, base, 'research/')
    expect(page.locator('.research-card')).to_have_count(len(PAPERS))
    follow(page, page.locator('a.research-card').first, base)
    assert '/research/' in page.url

    goto(page, base, 'cases/dropbox-magic-pocket/')
    expect(page.locator('.article-section')).to_have_count(4)
    assert page.locator('.term-link').count() >= 1
    # Select actual rendered editorial text, then exercise the honest AI boundary.
    page.evaluate('''() => {const p=document.querySelector('.article-section p');
        const r=document.createRange();r.selectNodeContents(p);const s=window.getSelection();
        s.removeAllRanges();s.addRange(r);document.dispatchEvent(new MouseEvent('mouseup'));}''')
    expect(page.locator('#selection-hint')).to_be_visible()
    page.locator('#selection-hint').click()
    expect(page.locator('.ai-drawer')).to_have_attribute('aria-hidden', 'false')
    assert '暂不提供自动回答' in page.locator('.ai-intro').inner_text()
    page.locator('#ai-close').click()
    expect(page.locator('.ai-drawer')).to_have_attribute('aria-hidden', 'true')
    assert_no_overflow(page)
    screenshot('article')
    follow(page, page.locator('.term-link[href*="erasure-coding/"]').first, base)
    assert page.url == urljoin(base, 'glossary/erasure-coding/')
    follow(page, page.locator('.case-click[href*="dropbox-magic-pocket/"]'), base)
    follow(page, page.locator('.header .brand'), base)
    assert page.url == base

    for section in ('products', 'companies', 'systems'):
        goto(page, base, section + '/')
        href = 'storage' if section == 'systems' else 'dropbox'
        follow(page, page.locator(f'main a[href$="{section}/{href}/"]').first, base)
        assert page.locator('.case-card').count() > 0
        follow(page, page.locator('.case-click').first, base)

    goto(page, base, 'skill/')
    download_link = page.locator('a[download="SKILL.md"]')
    with page.expect_download() as download_info:
        download_link.click()
    download = download_info.value
    assert download.failure() is None
    assert download.suggested_filename == 'SKILL.md'
    skill_bytes = Path(download.path()).read_bytes()
    assert skill_bytes == (SITE / 'skill/plica-architecture/SKILL.md').read_bytes()
    index_url = page.locator('a[href$="api/v1/index.json"]').evaluate('(a) => a.href')
    assert index_url == urljoin(base, 'api/v1/index.json')
    index_response = context.request.get(index_url)
    assert index_response.ok
    index = index_response.json()
    assert len(index['cases']) == len(CASES)
    assert len(index['papers']) == len(PAPERS)
    assert len(index['relations']) == len(RELATIONS)
    terms_response = context.request.get(urljoin(base, 'api/v1/terms.json'))
    assert terms_response.ok and len(terms_response.json()) == len(TERMS)
    assert not errors, errors
    assert not first_party_errors, first_party_errors
    context.close()
    return {'viewport': [width, height], 'product_filter_Dropbox': dropbox,
            'graph_options': graph_count, 'page_errors': errors,
            'first_party_errors': first_party_errors,
            'external_request_failures': sorted(set(external_failures)),
            'screenshots': screenshots,
            'checks': ['real HTTP and unchanged CSS/JS', 'home and nested navigation',
                       'mobile menu toggle/Escape/navigation' if name == 'mobile' else 'desktop navigation',
                       'product/company/system/search filters', 'empty/clear state',
                       'query initialization/reload/back history', 'comparison links',
                       'Spotify source/date', 'graph selection and article list navigation',
                       'glossary search and term navigation', 'research navigation',
                       'selection drawer and explicit non-AI boundary', 'article/term backlinks',
                       'product/company/system detail navigation', 'Skill download and JSON API',
                       'horizontal overflow on every visited page', 'uncaught JS and first-party request errors']}


def run_target(playwright, browser, base, label):
    parsed = urlparse(base)
    assert parsed.scheme in ('http', 'https') and parsed.netloc and not parsed.query and not parsed.fragment, (
        'PLICA_BASE_URL must be an HTTP(S) site base URL without query or fragment')
    base = base.rstrip('/') + '/'
    targets, static = internal_targets(base)
    request = playwright.request.new_context()
    try:
        for target in targets:
            response = request.get(target)
            assert response.ok, (response.status, target)
            assert response.url.startswith(base), ('redirect escapes deployment', target, response.url)
            if urlparse(target).path.endswith(('/', '.html')):
                assert 'text/html' in response.headers.get('content-type', ''), target
        static['http_targets_checked'] = len(targets)
    finally:
        request.dispose()
    result = {'base_url': base, 'static': static}
    for name, width, height in [('desktop', 1440, 900), ('mobile', 390, 844)]:
        result[name] = run_viewport(browser, base, label, name, width, height)
    return result


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    results = {'cases': len(CASES), 'terms': len(TERMS), 'papers': len(PAPERS),
               'relations': len(RELATIONS), 'output_directory': str(OUTPUT), 'targets': {}}
    with sync_playwright() as playwright:
        browser, executable = launch_browser(playwright)
        results['browser_executable'] = executable
        results['browser_version'] = browser.version
        try:
            live = os.environ.get('PLICA_BASE_URL')
            if live:
                results['targets']['live'] = run_target(playwright, browser, live, 'live')
            else:
                for label, mount in [('root', '/'), ('plica', '/plica/')]:
                    with local_site(mount) as base:
                        results['targets'][label] = run_target(playwright, browser, base, label)
        finally:
            browser.close()
    report = json.dumps(results, ensure_ascii=False, indent=2)
    (OUTPUT / 'report.json').write_text(report + '\n')
    print(report)


if __name__ == '__main__':
    main()
