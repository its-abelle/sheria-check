#!/usr/bin/env python3
"""Download an allowed official source. Does not bypass access restrictions or publish data."""
import argparse
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import urlopen

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--url', required=True)
parser.add_argument('--output', required=True)
args = parser.parse_args()
url = urlparse(args.url)
if url.scheme != 'https' or url.hostname not in {'new.kenyalaw.org', 'kenyalaw.org', 'www.kenyalaw.org', 'www.parliament.go.ke'} or url.username or url.password:
    parser.error('Use an approved official HTTPS source')
with urlopen(args.url, timeout=30) as response:
    body = response.read(20_000_001)
    if not body or len(body) > 20_000_000:
        raise ValueError('Empty or oversized legal source')
    Path(args.output).write_bytes(body)
    print(f'Downloaded {len(body)} bytes; verify source/version/permissions before import')
