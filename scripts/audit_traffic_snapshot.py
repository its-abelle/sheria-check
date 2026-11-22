#!/usr/bin/env python3
"""Compare draft wording to two extractions of the supplied PDF, not to current law."""
import argparse
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from traffic_snapshot import normalise_space, parse_snapshot

ROOT = Path(__file__).resolve().parent.parent

def content_digest(heading: str, text: str) -> str:
    return hashlib.sha256((normalise_space(heading) + '\n' + normalise_space(text)).encode()).hexdigest()


def audit(pdf: Path, bundle_path: Path) -> dict:
    layout = subprocess.run(['pdftotext', '-layout', str(pdf), '-'], check=True, capture_output=True, text=True).stdout
    raw = subprocess.run(['pdftotext', '-raw', str(pdf), '-'], check=True, capture_output=True, text=True).stdout
    layout_sections = parse_snapshot(layout)
    raw_sections = {section.number: section for section in parse_snapshot(raw)}
    bundle = json.loads(bundle_path.read_text())
    draft = {row['number'].removeprefix('Section '): row for row in bundle['provisions'] if row['instrument_id'] == 'traffic-act-2024-04-26'}
    records = []
    for section in layout_sections:
        other = raw_sections[section.number]
        row = draft.get(section.number)
        expected = content_digest(section.heading, section.text)
        independent = content_digest(other.heading, other.text)
        actual = content_digest(row['heading'], row['text']) if row else None
        records.append({
            'id': row['id'] if row else f'traffic-act-2024-04-26-s{section.number.lower()}',
            'number': 'Section ' + section.number,
            'pdf_pages': list(range(section.first_page, section.last_page + 1)),
            'content_sha256': actual,
            'layout_raw_alignment': expected == independent,
            'draft_alignment': actual == expected,
        })
    return {
        'scope': 'local_snapshot_text_alignment_only',
        'checked_at': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
        'source_file': pdf.name,
        'source_sha256': hashlib.sha256(pdf.read_bytes()).hexdigest(),
        'instrument_id': 'traffic-act-2024-04-26',
        'source_version': '2024-04-26',
        'method': 'Compare NFKC/whitespace-normalized headings and bodies from pdftotext layout and raw modes against drafts; TOC cross-check; PDF page references.',
        'provision_count': len(records),
        'all_text_aligned': len(draft) == len(records) and all(row['layout_raw_alignment'] and row['draft_alignment'] for row in records),
        'current_law_review': 'not_established',
        'source_access_permission': 'not_recorded',
        'publication_ready': False,
        'limitations': [
            'Two text extractions agreeing does not establish current law or legal interpretation.',
            'The supplied document is the 26 April 2024 historical snapshot, not a verified current consolidation.',
            'Visual inspection, acquisition/reuse basis, amendments, commencement, subsidiary instruments and applicable judgments still require review.',
            'No verified_at values or publication states are set by this command.',
        ],
        'provisions': records,
    }

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pdf', type=Path, default=ROOT / 'Traffic Act.pdf')
    parser.add_argument('--data', type=Path, default=ROOT / 'server/data/legal-content.json')
    parser.add_argument('--output', type=Path, default=ROOT / 'server/data/traffic-review.json')
    args = parser.parse_args()
    report = audit(args.pdf, args.data)
    args.output.write_text(json.dumps(report, indent=2) + '\n')
    print(f'Compared {report["provision_count"]} draft sections to the local snapshot. Text aligned: {report["all_text_aligned"]}. Publication remains on hold.')
    if not report['all_text_aligned']:
        raise SystemExit(1)
