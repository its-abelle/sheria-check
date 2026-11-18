#!/usr/bin/env python3
"""Import a source bundle as private drafts. Admin token must come from the environment."""
import argparse
import json
import os
from pathlib import Path
from urllib.request import Request, urlopen

if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--data', type=Path, default=Path(__file__).resolve().parents[1] / 'server/data/legal-content.json')
    p.add_argument('--api', default=os.getenv('SHERIA_API_URL', 'http://localhost:4000/api/v1'))
    p.add_argument('--dry-run', action='store_true')
    args = p.parse_args()
    body = args.data.read_bytes()
    if not isinstance(json.loads(body), dict):
        p.error('Expected a source bundle object, not legacy scraped offense arrays')
    if args.dry_run:
        print(f'Would import draft bundle ({len(body)} bytes). Nothing sent.')
    else:
        token = os.getenv('SHERIA_ADMIN_TOKEN')
        if not token:
            p.error('Set SHERIA_ADMIN_TOKEN in the environment')
        if not args.api.startswith(('https://', 'http://localhost:', 'http://127.0.0.1:')):
            p.error('Use HTTPS for remote admin requests')
        request = Request(args.api.rstrip('/') + '/admin/content/import', data=body, headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}, method='POST')
        try:
            with urlopen(request, timeout=30) as response:
                print(response.read().decode())
        except Exception:
            p.exit(1, 'Import failed. Check connectivity, token and bundle validation.\n')
