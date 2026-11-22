"""Mechanical parsing of the supplied 2024 PDF; never a legal verification."""
from dataclasses import dataclass
import re
import unicodedata

@dataclass(frozen=True)
class SnapshotSection:
    number: str
    heading: str
    text: str
    first_page: int
    last_page: int


def normalise_space(text: str) -> str:
    return ' '.join(unicodedata.normalize('NFKC', text).split())


def toc_headings(text: str) -> dict[str, str]:
    entries: dict[str, str] = {}
    current: str | None = None
    pieces: list[str] = []
    for line in text.splitlines():
        match = re.match(r'^\s{0,7}(\d+[A-Z]?)\. (.+)', line)
        if match:
            current = match.group(1)
            pieces = [match.group(2).strip()]
        elif current and line.strip():
            pieces.append(line.strip())
        if current and re.search(r'\.{3,}\s*\d+\s*$', ' '.join(pieces)):
            entries[current] = re.sub(r'\s*\.{3,}\s*\d+\s*$', '', ' '.join(pieces)).strip()
            current = None
            pieces = []
    return entries


def parse_snapshot(raw: str) -> list[SnapshotSection]:
    raw = unicodedata.normalize('NFKC', raw)
    if 'Legislation as at 26 April 2024' not in raw:
        raise ValueError('Unexpected snapshot version')
    start = list(re.finditer(r'^\s{0,2}1\. Short title\s*$', raw, re.M))
    if len(start) != 1:
        raise ValueError('Cannot identify the legislative body unambiguously')
    titles = toc_headings(raw[:start[0].start()])
    lines: list[tuple[str, int]] = []
    part_heading = False
    for page_number, page in enumerate(raw.split('\f'), 1):
        page_lines = page.splitlines()
        meaningful = [i for i, line in enumerate(page_lines) if line.strip()]
        remove: set[int] = set()
        if meaningful and re.fullmatch(r'\d+', page_lines[meaningful[-1]].strip()):
            # A footer only: numbers inside the legal body must remain intact.
            remove.add(meaningful[-1])
        if meaningful and re.match(r'^Traffic Act \(Cap\. 403\)', page_lines[meaningful[0]].strip()):
            remove.add(meaningful[0])
            if len(meaningful) > 1 and page_lines[meaningful[1]].strip() == 'Kenya':
                remove.add(meaningful[1])
        for index, line in enumerate(page_lines):
            if index in remove:
                continue
            clean = line.strip()
            if re.match(r'^Part [IVX]+[AB]?\s*[–—-]', clean):
                part_heading = True
                continue
            if part_heading and (not clean or clean.isupper()):
                continue
            part_heading = False
            lines.append((line, page_number))
    beginning = [i for i, (line, _) in enumerate(lines) if re.fullmatch(r'\s{0,2}1\. Short title\s*', line)]
    if len(beginning) != 1:
        raise ValueError('Missing body after page cleanup')
    lines = lines[beginning[0]:]
    schedule = next((i for i, (line, _) in enumerate(lines) if re.fullmatch(r'\s*SCHEDULE(?:\s+\[.*\])?\s*', line)), len(lines))
    lines = lines[:schedule]
    headers = [(i, re.match(r'^\s{0,2}(\d+[A-Z]?)\. (.+)', line)) for i, (line, _) in enumerate(lines)]
    headers = [(i, match) for i, match in headers if match is not None]
    sections: list[SnapshotSection] = []
    for index, (line_index, match) in enumerate(headers):
        assert match is not None
        number, heading = match.groups()
        end = headers[index + 1][0] if index + 1 < len(headers) else len(lines)
        body_start = line_index + 1
        expected = titles.get(number)
        # Complete only a heading independently attested by the document's TOC.
        while expected and normalise_space(heading) != normalise_space(expected) and body_start < end:
            continuation = lines[body_start][0].strip()
            if not continuation:
                body_start += 1
                continue
            candidate = heading.strip() + ' ' + continuation
            if not normalise_space(expected).startswith(normalise_space(candidate)):
                raise ValueError(f'Section {number}: body heading differs from the TOC')
            heading = candidate
            body_start += 1
        body_lines = lines[body_start:end]
        text = re.sub(r'\n{3,}', '\n\n', '\n'.join(line.strip() for line, _ in body_lines)).strip()
        if not text and heading.strip().lstrip('[').lower().startswith(('deleted', 'repealed')):
            text = heading.strip()
        if not text:
            raise ValueError(f'Section {number}: empty body')
        last_page = next((page for line, page in reversed(body_lines) if line.strip()), lines[line_index][1])
        sections.append(SnapshotSection(number, heading.strip(), text, lines[line_index][1], last_page))
    numbers = {section.number for section in sections}
    if len(numbers) != len(sections) or '120' not in numbers:
        raise ValueError('Incomplete or duplicate sections')
    if titles and numbers != set(titles):
        raise ValueError('Section set differs from the supplied PDF table of contents')
    return sections
