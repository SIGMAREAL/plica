#!/usr/bin/env python3
"""Compatibility entry point; validation belongs exclusively to the backend."""
from backend.__main__ import main


if __name__ == '__main__':
    import sys
    sys.argv = [sys.argv[0], 'validate']
    main()
