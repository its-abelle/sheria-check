#!/usr/bin/env python3
"""Fetch a single authorized source and record provenance; never bypass restrictions."""
import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import urlopen

ALLOWED_HOSTS = {'new.kenyalaw.org', 'kenyalaw.org', 'www.kenyalaw.org', 'www.parliament.go.ke'}

def check_url(value: str) -> None:
    url = urlparse(value)
    if url.scheme != 'https' or url.hostname not in ALLOWED_HOSTS or url.username or url.password or url.query or url.fragment or url.port not in (None, 443):
        raise ValueError('Use an approved official HTTPS document URL without credentials or query parameters')


def download(url: str, output: Path, permission_reference: str) -> dict:
    check_url(url)
    if not permission_reference.strip() or len(permission_reference) > 200:
        raise ValueError('Record a valid source-access permission reference before fetching')
    with urlopen(url, timeout=30) as response:
        final_url = response.geturl()
        check_url(final_url)
        body = response.read(20_000_001)
        content_type = response.headers.get('Content-Type', '')
        if not body or len(body) > 20_000_000:
            raise ValueError('Empty or oversized source; nothing imported')
        if 'html' in content_type.lower() or body.lstrip().lower().startswith((b'<!doctype html', b'<html')):
            raise ValueError('HTML/challenge response is not a source document; arrange authorized access')
    evidence = {
        'source_url': url,
        'resolved_url': final_url,
        'retrieved_at': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
        'sha256': hashlib.sha256(body).hexdigest(),
        'content_type': content_type,
        'permission_reference': permission_reference.strip(),
        'legal_verification': 'not_performed',
    }
    output.write_bytes(body)
    output.with_suffix(output.suffix + '.provenance.json').write_text(json.dumps(evidence, indent=2) + '\n')
    return evidence

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--permission-reference', required=True, help='Non-secret agreement/permission reference; never an API key or credential')
    args = parser.parse_args()
    try:
        download(args.url, args.output, args.permission_reference)
    except Exception as error:
        parser.exit(1, f'Source fetch stopped: {error}\n')
    print('Downloaded authorized source and provenance sidecar. Verify wording/version/reuse before import.')
