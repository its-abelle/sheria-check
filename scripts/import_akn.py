#!/usr/bin/env python3
"""Convert an authorized official Akoma Ntoso XML download to an unpublished bundle.

Review access/reuse terms before downloading. This command performs no network calls.
It preserves original provision text and requires a separate publication review.
"""
import argparse
import hashlib
import json
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

NS = {'a': 'http://docs.oasis-open.org/legaldocml/ns/akn/3.0'}
def prepare(path: Path, law_id: str, title: str, version: str, source: str, rights: str) -> dict:
    parsed = urlparse(source)
    if parsed.scheme != 'https' or parsed.hostname not in {'new.kenyalaw.org', 'kenyalaw.org', 'www.kenyalaw.org'}:
        raise ValueError('An official HTTPS source is required')
    tree = ET.fromstring(path.read_bytes())
    body = tree.find('.//a:body', NS)
    if body is None:
        raise ValueError('No Akoma Ntoso legislative body; do not import HTML/error pages')
    records = []
    for node in body.iter():
        if node.tag.split('}')[-1] not in {'section', 'article', 'rule', 'regulation'}:
            continue
        number = node.find('a:num', NS)
        heading = node.find('a:heading', NS)
        eid = node.get('eId', '')
        if number is None or heading is None or not eid:
            raise ValueError('Missing provision number, heading or source anchor')
        # Exclude title elements from text, preserve subsection numbers, paragraphs and editorial amendment notes.
        parts = [' '.join(child.itertext()).strip() for child in node if child not in (number, heading)]
        text = '\n\n'.join(part for part in parts if part)
        if not text:
            raise ValueError(f'Empty provision {eid}')
        records.append({'id': f'{law_id}-{eid.replace("__", "-").replace("_", "-")}'.lower(), 'instrument_id': law_id, 'position': len(records) + 1, 'number': ''.join(number.itertext()).strip(), 'heading': ''.join(heading.itertext()).strip(), 'text': text, 'source_url': f'{source}#{eid}', 'topics': [], 'verified_at': None})
    if not records:
        raise ValueError('No provisions extracted; manual review is needed')
    now = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    return {'instruments': [{'id': law_id, 'title': title, 'version': version, 'source_url': source, 'retrieved_at': now, 'verified_at': None, 'rights_basis': rights}], 'provisions': records, 'offenses': [], 'judgments': [], 'links': []}

if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    for name in ['input', 'id', 'title', 'version', 'source', 'rights-basis', 'output']:
        p.add_argument('--' + name, required=True)
    args = p.parse_args()
    result = prepare(Path(args.input), args.id, args.title, args.version, args.source, args.rights_basis)
    Path(args.output).write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(f'Prepared {len(result["provisions"])} draft provisions. SHA-256: {hashlib.sha256(Path(args.input).read_bytes()).hexdigest()}')
