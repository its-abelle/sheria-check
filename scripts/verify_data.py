#!/usr/bin/env python3
"""Check draft source-bundle structure. Legal verification is a separate human step."""
import argparse
import json
from pathlib import Path
from urllib.parse import urlparse

def verify(path: Path) -> list[str]:
    data = json.loads(path.read_text())
    if not isinstance(data, dict):
        return ['Expected a legal source bundle; legacy scraped arrays cannot be published']
    errors = []
    groups = ['instruments', 'provisions', 'offenses', 'judgments']
    ids = {}
    for kind in groups:
        records = data.get(kind, [])
        ids[kind] = set()
        for record in records:
            rid = record.get('id')
            if not rid or rid in ids[kind]: errors.append(f'{kind}: missing or duplicate ID {rid}')
            ids[kind].add(rid)
            if 'publication_status' in record: errors.append(f'{rid}: imports cannot set publication status')
            if kind != 'offenses':
                source = urlparse(record.get('source_url', ''))
                if source.scheme != 'https' or source.hostname not in {'new.kenyalaw.org', 'kenyalaw.org', 'www.kenyalaw.org', 'judiciary.go.ke', 'www.judiciary.go.ke'}: errors.append(f'{rid}: non-official source')
            if kind == 'provisions' and not record.get('text', '').strip(): errors.append(f'{rid}: empty provision')
    for p in data.get('provisions', []):
        if p.get('instrument_id') not in ids['instruments']: errors.append(f'{p["id"]}: missing instrument')
    for o in data.get('offenses', []):
        for key in ['defining_provision_id', 'penalty_provision_id']:
            if o.get(key) not in ids['provisions']: errors.append(f'{o["id"]}: missing {key}')
    return errors

if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--data', type=Path, default=Path(__file__).resolve().parents[1] / 'server/data/legal-content.json')
    p.add_argument('--strict', action='store_true', help='Retained for compatibility; errors always fail')
    args = p.parse_args()
    errors = verify(args.data)
    for error in errors: print(error)
    if errors: raise SystemExit(1)
    print('Structure valid. No legal accuracy or completeness claim is made.')
