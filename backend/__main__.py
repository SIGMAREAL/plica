"""python3 -m backend {validate,build,serve}. No UI or third-party dependency."""
import argparse
from pathlib import Path

from .catalog import ROOT, export_catalog, load_catalog


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    commands.add_parser('validate', help='Validate editorial sources without building a UI')
    build = commands.add_parser('build', help='Export the public API and Skill')
    build.add_argument('--output', type=Path, default=ROOT / 'dist')
    serve = commands.add_parser('serve', help='Build and serve the read-only API for UI development')
    serve.add_argument('--host', default='127.0.0.1')
    serve.add_argument('--port', type=int, default=8001)
    serve.add_argument('--allow-origin', default='*', help='CORS origin for the public API; no credentials')
    args = parser.parse_args()
    try:
        if args.command == 'validate':
            catalog = load_catalog()
        elif args.command == 'build':
            catalog = export_catalog(args.output.resolve())
        else:
            from .server import serve_api
            serve_api(args.host, args.port, args.allow_origin)
            return
    except (ValueError, KeyError) as exc:
        parser.exit(1, str(exc) + '\n')
    print(f"Content validated: {len(catalog['cases'])} production cases; "
          f"{len(catalog['papers'])} research papers; {len(catalog['terms'])} terms; "
          f"{len(catalog['relations'])} reviewed relations; "
          f"{len(catalog['organizations'])} publishers")


if __name__ == '__main__':
    main()
