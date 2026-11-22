#!/usr/bin/env python3
"""Prepare PRIVATE drafts from the local official Traffic Act PDF (requires pdftotext).

Original legislative wording only; excludes the publisher's cover, TOC and PDF layout.
This is extraction, not legal verification. Never marks records verified or published.
"""
import argparse
import hashlib
import json
import subprocess
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from traffic_snapshot import parse_snapshot

ROOT = Path(__file__).resolve().parent.parent
VERSION = '2024-04-26'
LAW_ID = f'traffic-act-{VERSION}'
SOURCE = f'https://new.kenyalaw.org/akn/ke/act/1953/39/eng@{VERSION}'

def prepare(pdf: Path) -> dict:
    raw = subprocess.run(['pdftotext', '-layout', str(pdf), '-'], check=True, capture_output=True, text=True).stdout
    raw = unicodedata.normalize('NFKC', raw)
    if f'Legislation as at 26 April 2024' not in raw or 'There is no copyright on the legislative content' not in raw:
        raise ValueError('Unexpected PDF/version/rights notice; review before adapting this importer')
    sections = parse_snapshot(raw)
    provisions = [
        {'id': f'{LAW_ID}-s{section.number.lower()}', 'instrument_id': LAW_ID,
         'number': f'Section {section.number}', 'position': index + 1,
         'heading': section.heading, 'text': section.text, 'topics': [],
         'source_url': f'{SOURCE}#sec_{section.number}', 'verified_at': None}
        for index, section in enumerate(sections)
    ]
    # These records point to full sections, including exceptions and conditional penalties.
    selected = [
        ('speed-of-motor-vehicles', 'Speed of motor vehicles', 'speeding-reckless', '42', '43', ['speeding', 'speed limit']),
        ('driving-under-influence', 'Driving under influence of drink', 'alcohol-drugs', '44', '44', ['drink driving', 'drunk driving']),
        ('reckless-driving', 'Reckless driving', 'speeding-reckless', '47', '47', ['dangerous driving']),
        ('driving-without-due-care', 'Driving without due care and attention', 'speeding-reckless', '49', '49', ['careless driving']),
        ('signals-and-signs', 'Signals and signs to be obeyed', 'traffic-rules', '52', '52', ['traffic lights', 'road signs']),
    ]
    offenses = [{'id': oid, 'name': name, 'aliases': aliases, 'category': category, 'defining_provision_id': f'{LAW_ID}-s{definition}', 'penalty_provision_id': f'{LAW_ID}-s{penalty}', 'verified_at': None} for oid, name, category, definition, penalty, aliases in selected]
    retrieved = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    result = {'instruments': [{'id': LAW_ID, 'title': 'Traffic Act (Cap. 403)', 'source_url': SOURCE, 'version': VERSION, 'retrieved_at': retrieved, 'verified_at': None, 'rights_basis': 'Private draft transcription of the supplied 2024 PDF, including bracketed source amendment references. Source: Kenya Law and Laws.Africa. The PDF states legislative content has no copyright and separately licenses the PDF copy CC BY-NC-SA 4.0. Acquisition, annotation reuse and app republication basis remain unconfirmed; no permission is asserted. See docs/CONTENT.md and docs/LEGAL_SOURCE_REVIEW.md.'}], 'provisions': provisions, 'offenses': offenses, 'judgments': [], 'links': []}
    manifest = {'source_file': pdf.name, 'sha256': hashlib.sha256(pdf.read_bytes()).hexdigest(), 'version': VERSION, 'prepared_at': retrieved, 'status': 'unverified draft', 'provisions': len(provisions), 'note': 'Section text must be compared to the official source before publication. Schedules are not imported.'}
    (ROOT / 'server/data').mkdir(parents=True, exist_ok=True)
    (ROOT / 'server/data/traffic-source.json').write_text(json.dumps(manifest, indent=2) + '\n')
    return result

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pdf', type=Path, default=ROOT / 'Traffic Act.pdf')
    parser.add_argument('--output', type=Path, default=ROOT / 'server/data/legal-content.json')
    args = parser.parse_args()
    bundle = prepare(args.pdf)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(bundle, ensure_ascii=False, indent=2) + '\n')
    print(f'Prepared {len(bundle["provisions"])} PRIVATE DRAFT provisions and {len(bundle["offenses"])} offense references. No content is verified or published.')
