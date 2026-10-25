"""Read-only public API development server; never serves editorial source paths."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import urlsplit

from .catalog import export_catalog

PUBLIC_PATHS = frozenset({
    '/api/v1/catalog.json', '/api/v1/index.json', '/api/v1/terms.json',
    '/skill/plica-architecture/SKILL.md',
})


class APIHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, allow_origin='*', **kwargs):
        self.allow_origin = allow_origin
        super().__init__(*args, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', self.allow_origin)
        self.send_header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def do_GET(self):
        if urlsplit(self.path).path not in PUBLIC_PATHS:
            self.send_error(404, 'Unknown API resource')
            return
        super().do_GET()

    def do_HEAD(self):
        if urlsplit(self.path).path not in PUBLIC_PATHS:
            self.send_error(404, 'Unknown API resource')
            return
        super().do_HEAD()

    def do_OPTIONS(self):
        if urlsplit(self.path).path not in PUBLIC_PATHS:
            self.send_error(404, 'Unknown API resource')
            return
        self.send_response(204)
        self.end_headers()


def serve_api(host, port, allow_origin):
    # Temporary export keeps UI development away from tracked deployment snapshots.
    with TemporaryDirectory(prefix='plica-api-') as temporary:
        output = Path(temporary)
        export_catalog(output)
        handler = partial(APIHandler, directory=str(output), allow_origin=allow_origin)
        with ThreadingHTTPServer((host, port), handler) as server:
            print(f'Plica public API: http://{host}:{server.server_port}/api/v1/catalog.json', flush=True)
            print('Read-only snapshot; restart after editing backend/content/.', flush=True)
            try:
                server.serve_forever()
            except KeyboardInterrupt:
                pass
