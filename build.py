#!/usr/bin/env python3
"""Compose public API and independently built static or React UI releases."""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--frontend', choices=['static', 'react'], default='static')
    args = parser.parse_args()
    # Both stages communicate only through release files, including in this wrapper.
    with tempfile.TemporaryDirectory(prefix='plica-build-') as temporary:
        release = Path(temporary)
        api, ui = release / 'backend', release / 'frontend'
        subprocess.run([sys.executable, '-m', 'backend', 'build', '--output', str(api)],
                       cwd=ROOT, check=True)
        if args.frontend == 'react':
            subprocess.run(
                ['npm', 'run', 'build', '--', '--outDir', str(ui), '--emptyOutDir'],
                cwd=ROOT / 'frontend/prototype', check=True,
                env={**os.environ, 'PLICA_CATALOG_PATH': str(api / 'api/v1/catalog.json')},
            )
            (ui / 'release.json').write_text(json.dumps({
                'ui': 'kumo-react', 'revision': os.environ.get('PLICA_REVISION', 'local'),
            }) + '\n')
        else:
            subprocess.run([sys.executable, str(ROOT / 'frontend/build.py'),
                            '--api-dir', str(api / 'api/v1'), '--output', str(ui)], check=True)
        shutil.copytree(api, ui, dirs_exist_ok=True)
        output = (ROOT / 'frontend/prototype/release' if args.frontend == 'react'
                  else ROOT / 'site')
        # Both destinations are generated snapshots; authored source stays separate.
        # Remove obsolete output only after both independent builds have succeeded.
        for path in output.rglob('*'):
            if path.is_file() and not (ui / path.relative_to(output)).is_file():
                path.unlink()
        shutil.copytree(ui, output, dirs_exist_ok=True)


if __name__ == '__main__':
    main()
