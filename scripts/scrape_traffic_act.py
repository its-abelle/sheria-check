#!/usr/bin/env python3
"""
Sheria Check — Traffic Act Scraper

Extracts all offenses, penalties, and citations from the Traffic Act (Cap. 403)
for import into the Sheria Check database.

Sources (tried in order):
  1. Kenya Law HTML (new.kenyalaw.org) — structured Akoma Ntoso format
  2. Kenya Law PDF download — full text with sections
  3. Local cached JSON — avoids re-downloading

Usage:
    python scripts/scrape_traffic_act.py
    python scripts/scrape_traffic_act.py --source pdf --pdf /path/to/traffic_act.pdf
    python scripts/scrape_traffic_act.py --source html
    python scripts/scrape_traffic_act.py --output /path/to/output.json

Output:
    JSON array of offense objects matching the API schema, written to stdout or file.
"""

import argparse
import json
import logging
import os
import re
import sys
import time
from pathlib import Path
from typing import Any

logger = logging.getLogger("sheria_scraper")

# ─── Constants ────────────────────────────────────────────────────────

ACT_NAME = "Traffic Act Cap 403"
ACT_CITATION = "Cap. 403"
LAW_VERSION = "2024"
DEFAULT_OUTPUT = Path(__file__).parent / "seed_data_full.json"

KENYA_LAW_HTML_URL = "https://new.kenyalaw.org/akn/ke/act/1953/39/eng@2024-04-26"
KENYA_LAW_PDF_URL = "https://new.kenyalaw.org/akn/ke/act/1953/39/eng@2024-04-26/source"

# Local fallback paths searched when online sources return 403
LOCAL_PDF_CANDIDATES = [
    Path.cwd() / "Traffic Act.pdf",
    Path.cwd() / "traffic_act.pdf",
    Path.cwd() / "Traffic_Act.pdf",
    Path(__file__).parent.parent / "Traffic Act.pdf",
    Path(__file__).parent.parent / "traffic_act.pdf",
]

CATEGORY_KEYWORDS: list[tuple[str, str]] = [
    ("speeding", "speeding-reckless"),
    ("speed limit", "speeding-reckless"),
    ("racing", "speeding-reckless"),
    ("pacemaking", "speeding-reckless"),
    ("dangerous driving", "speeding-reckless"),
    ("reckless", "speeding-reckless"),
    ("careless driving", "speeding-reckless"),
    ("driving licence", "license-documents"),
    ("driving license", "license-documents"),
    ("licence", "license-documents"),
    ("license", "license-documents"),
    ("insurance", "license-documents"),
    ("driving without", "license-documents"),
    ("tyre", "vehicle-condition"),
    ("tire", "vehicle-condition"),
    ("condition of vehicle", "vehicle-condition"),
    ("brake", "vehicle-condition"),
    ("light", "vehicle-condition"),
    ("silencer", "vehicle-condition"),
    ("mirror", "vehicle-condition"),
    ("overtaking", "traffic-rules"),
    ("overtake", "traffic-rules"),
    ("traffic light", "traffic-rules"),
    ("traffic sign", "traffic-rules"),
    ("road sign", "traffic-rules"),
    ("obstruction", "traffic-rules"),
    ("pedestrian crossing", "traffic-rules"),
    ("parking", "parking-loading"),
    ("load", "parking-loading"),
    ("overload", "parking-loading"),
    ("alcohol", "alcohol-drugs"),
    ("drink", "alcohol-drugs"),
    ("drug", "alcohol-drugs"),
    ("intoxicat", "alcohol-drugs"),
    ("under the influence", "alcohol-drugs"),
]

SEVERITY_IMPRISONMENT_LIMITS: list[tuple[str, int]] = [
    ("felony", 12 * 30),  # > 12 months → felony
    ("serious", 30),      # > 1 month → serious
]

# Fine thresholds
FELONY_FINE_THRESHOLD = 100_000

# ─── Text Parsing Utilities ───────────────────────────────────────────

NUMBER_MAP = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14,
    "fifteen": 15, "sixteen": 16, "seventeen": 17, "eighteen": 18,
    "nineteen": 19, "twenty": 20, "thirty": 30, "forty": 40,
    "fifty": 50, "sixty": 60, "seventy": 70, "eighty": 80,
    "ninety": 90, "hundred": 100, "thousand": 1000,
    "million": 1_000_000,
}

WORD_NUMBERS = re.compile(
    r"(?:not\s+exceeding\s+)?"
    r"(?:"
    r"(?:"
    r"(?:one|two|three|four|five|six|seven|eight|nine|ten|"
    r"eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|"
    r"eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|"
    r"eighty|ninety|hundred|thousand|million)"
    r"(?:\s+(?:and\s+)?)?"
    r")+"
    r"\s+(?:hundred\s+)?(?:thousand\s+)?"
    r")?shillings?",
    re.IGNORECASE
)

FINE_PATTERN = re.compile(
    r"(?:fine\s+(?:not\s+)?(?:exceeding\s+)?)"
    r"(?:"
    r"(?:KES\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)"  # numeric: "100,000"
    r"|"
    r"([\w\s]+?shillings?)"                         # words: "one hundred thousand shillings"
    r")",
    re.IGNORECASE
)

IMPRISONMENT_PATTERN = re.compile(
    r"imprisonment\s+for\s+a\s+term\s+(?:not\s+)?(?:exceeding\s+)?"
    r"(?:(\d+)\s+years?\s*(?:\d+\s+months?)?"
    r"|(\d+)\s+months?)",
    re.IGNORECASE
)

SECTION_HEADER = re.compile(
    r"^(\d+[A-Za-z]?)\.\s+(.+)$",
    re.MULTILINE
)


def parse_word_number(text: str) -> int | None:
    """Convert English words like 'one hundred thousand' to integer."""
    text = text.lower().strip()
    # Remove "not exceeding" prefix
    text = re.sub(r"^not\s+exceeding\s+", "", text)
    # Remove "shillings" suffix
    text = re.sub(r"\s+shillings?$", "", text)
    text = text.strip()

    words = text.replace("-", " ").split()
    if not words:
        return None

    total = 0
    current = 0

    for word in words:
        word = word.strip()
        if word == "and":
            continue
        if word in NUMBER_MAP:
            val = NUMBER_MAP[word]
            if val >= 1000:
                current = max(current, 1) * val
                total += current
                current = 0
            elif val >= 100:
                current = max(current, 1) * val
            else:
                current += val
        else:
            logger.warning(f"Unknown number word: {word}")
            return None

    total += current
    return total if total > 0 else None


def parse_fine(text: str) -> tuple[int, int] | None:
    """
    Extract numeric fine range from text.
    Returns (min_fine, max_fine) in KES.
    """
    amounts = []

    # Try numeric patterns first
    for match in re.finditer(r"(?:fine\s+(?:not\s+)?(?:exceeding\s+)?)?(?:KES\s*)?(\d{1,3}(?:,\d{3})+)", text, re.IGNORECASE):
        amounts.append(int(match.group(1).replace(",", "")))

    # Try simple numeric
    for match in re.finditer(r"(?:fine\s+(?:not\s+)?(?:exceeding\s+)?)?(\d{1,3}(?:,\d{3})*)\s*(?:shillings|/-)", text, re.IGNORECASE):
        amounts.append(int(match.group(1).replace(",", "")))

    # Try word numbers with "shillings" suffix
    for match in re.finditer(
        r"(?:fine\s+(?:not\s+)?(?:exceeding\s+)?)?"
        r"((?:one|two|three|four|five|six|seven|eight|nine|ten|"
        r"eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|"
        r"eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|"
        r"eighty|ninety|hundred|thousand|million|and|\s)+shillings?)",
        text, re.IGNORECASE
    ):
        parsed = parse_word_number(match.group(1))
        if parsed:
            amounts.append(parsed)

    # Try word numbers WITHOUT "shillings" suffix but in fine context
    # e.g. "fine not exceeding one hundred thousand or to imprisonment"
    for match in re.finditer(
        r"fine\s+(?:not\s+)?(?:exceeding\s+)?"
        r"((?:one|two|three|four|five|six|seven|eight|nine|ten|"
        r"eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|"
        r"eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|"
        r"eighty|ninety|hundred|thousand|million|and|\s+)+?)"
        r"(?:\s+or\s+to\s+imprisonment|\s+and\s+in\s+addition|\s*[;.]|\s+and\s+the\s+court)",
        text, re.IGNORECASE
    ):
        clean = match.group(1).strip()
        parsed = parse_word_number(clean)
        if parsed:
            amounts.append(parsed)

    if not amounts:
        return None

    return (min(amounts), max(amounts))


WORD_DIGIT_MAP = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14,
    "fifteen": 15, "sixteen": 16, "seventeen": 17, "eighteen": 18,
    "nineteen": 19, "twenty": 20, "thirty": 30, "forty": 40,
    "fifty": 50, "sixty": 60, "seventy": 70, "eighty": 80,
    "ninety": 90, "hundred": 100,
}


def parse_duration_word(word: str) -> int | None:
    """Parse a duration word like 'ten' → 10, or digit string like '10' → 10."""
    word = word.strip().lower()
    # Try as digit
    try:
        return int(word)
    except ValueError:
        pass
    # Try as word number
    return WORD_DIGIT_MAP.get(word)


def parse_imprisonment(text: str) -> tuple[str | None, int]:
    """
    Extract imprisonment term and total days from text.
    Handles both digit and word numbers.
    Examples: "imprisonment for a term not exceeding ten years"
              "imprisonment for a term not exceeding 2 years"
              "imprisonment for a term not exceeding six months"
              "liable to imprisonment for a term not exceeding 3 years"
    Returns (human_readable_string, total_days).
    """
    # Pattern: imprisonment ... (not exceeding) X years (Y months) | X months
    match = re.search(
        r"imprisonment\s+for\s+a\s+term\s+(?:not\s+)?(?:exceeding\s+)?"
        r"("
        r"(?:\d+|[a-zA-Z]+)\s+years?\s*(?:(?:\d+|[a-zA-Z]+)\s+months?\s*)?"
        r"|"
        r"(?:\d+|[a-zA-Z]+)\s+months?"
        r")",
        text, re.IGNORECASE
    )
    if not match:
        return (None, 0)

    duration_str = match.group(1).strip()
    years = 0
    months = 0

    # Try to extract years
    year_match = re.search(r"(?:\d+|[a-zA-Z]+)\s+years?", duration_str, re.IGNORECASE)
    if year_match:
        num_part = re.match(r"(\d+|[a-zA-Z]+)", year_match.group(0))
        if num_part:
            y = parse_duration_word(num_part.group(1))
            if y:
                years = y

    # Try to extract months within years pattern or standalone
    month_match = re.search(r"(?:\d+|[a-zA-Z]+)\s+months?", duration_str, re.IGNORECASE)
    if month_match:
        num_part = re.match(r"(\d+|[a-zA-Z]+)", month_match.group(0))
        if num_part:
            m = parse_duration_word(num_part.group(1))
            if m:
                months = m

    total_days = years * 365 + months * 30

    parts = []
    if years:
        parts.append(f"{years} year{'s' if years != 1 else ''}")
    if months:
        parts.append(f"{months} month{'s' if months != 1 else ''}")
    return (" ".join(parts), total_days)


def classify_category(text: str) -> str:
    """Classify text into one of the 6 offense categories."""
    text_lower = text.lower()
    for keyword, category in CATEGORY_KEYWORDS:
        if keyword in text_lower:
            return category
    return "traffic-rules"


def classify_severity(fine_amounts: tuple[int, int] | None, imprisonment_days: int) -> str:
    """Classify severity based on fine amounts and imprisonment term."""
    if imprisonment_days >= 365:
        return "felony"
    if imprisonment_days >= 30:
        return "serious"
    if fine_amounts and fine_amounts[1] >= FELONY_FINE_THRESHOLD:
        return "serious"
    return "minor"


def generate_course_of_action(section_text: str, severity: str) -> str:
    """Generate appropriate course of action based on severity and section context."""
    text_lower = section_text.lower()
    has_arrest = any(kw in text_lower for kw in ["arrest", "cognizable", "warrant", "summons"])

    if severity == "felony":
        return (
            "THIS IS A CRIMINAL OFFENSE. You may be arrested. Do not attempt to settle on the spot. "
            "You have the right to remain silent and to contact a lawyer immediately. "
            "The officer must issue a charge sheet. Appear in court on the date specified."
        )
    elif severity == "serious":
        return (
            "This is a serious traffic offense. The officer should issue a charge sheet (P.B. Form). "
            "Do not pay any amount on the spot. Consider seeking legal representation. "
            "Appear in court on the date specified in the charge sheet."
        )
    else:
        return (
            "The officer may issue a charge sheet (P.B. Form) or a police notification of a traffic offence. "
            "Do not pay any amount on the spot. You may plead guilty by paying the fine as directed "
            "on the notification, or appear in court on the date specified if you wish to contest."
        )


# ─── Source Parsers ───────────────────────────────────────────────────

def parse_pdf(pdf_path: str) -> list[dict[str, Any]]:
    """Parse the Traffic Act PDF and extract offenses."""
    import pdfplumber

    logger.info(f"Parsing PDF: {pdf_path}")
    offenses: list[dict[str, Any]] = []
    current_section_num = ""
    current_section_title = ""
    current_text = ""

    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            text = page.extract_text()
            if not text:
                continue

            lines = text.split("\n")

            for line in lines:
                line = line.strip()
                if not line:
                    continue

                # Check for section headers like "42. Speed limits"
                section_match = re.match(r"^(\d+[A-Za-z]?)\.\s+(.+?)(?:\s*\.{3,}.*)?$", line)
                if section_match:
                    # Process previous section if it had penalty info
                    if current_text and re.search(r"(?:fine|penalty|imprisonment)", current_text, re.IGNORECASE):
                        offense = _build_offense(
                            section_num=current_section_num,
                            section_title=current_section_title,
                            section_text=current_text,
                        )
                        if offense:
                            offenses.append(offense)

                    current_section_num = section_match.group(1)
                    current_section_title = section_match.group(2).strip()
                    current_text = line + "\n"
                    continue

                # Check for Part headers
                if re.match(r"^Part\s+\w+", line, re.IGNORECASE):
                    if current_text and re.search(r"(?:fine|penalty|imprisonment)", current_text, re.IGNORECASE):
                        offense = _build_offense(
                            section_num=current_section_num,
                            section_title=current_section_title,
                            section_text=current_text,
                        )
                        if offense:
                            offenses.append(offense)
                    current_text = ""
                    continue

                current_text += line + "\n"

        # Process last section
        if current_text and re.search(r"(?:fine|penalty|imprisonment)", current_text, re.IGNORECASE):
            offense = _build_offense(
                section_num=current_section_num,
                section_title=current_section_title,
                section_text=current_text,
            )
            if offense:
                offenses.append(offense)

    logger.info(f"Extracted {len(offenses)} offenses from PDF")
    return offenses


def _build_offense(
    section_num: str,
    section_title: str,
    section_text: str,
) -> dict[str, Any] | None:
    """Build an offense record from a parsed section."""
    if not section_num:
        return None

    # Determine section range
    section = section_num
    if "." in section:
        section = section.split(".")[0]

    # Generate stable ID
    name = section_title.strip()
    offense_id = re.sub(r"[^a-z0-9-]", "", name.lower().replace(" ", "-"))[:50]
    if not offense_id:
        offense_id = f"section-{section}"

    # Parse penalties
    fine = parse_fine(section_text)
    imprisonment_str, imprisonment_days = parse_imprisonment(section_text)
    severity = classify_severity(fine, imprisonment_days)
    category = classify_category(name + " " + section_text)

    if not fine:
        logger.debug(f"No fine found for section {section}: {name[:60]}")
        # Still include if it has imprisonment
        if not imprisonment_days:
            return None

    # Build description from first relevant sentence
    description = _extract_description(name, section_text)

    citation = f"Traffic Act Cap 403, Section {section}"

    return {
        "id": offense_id,
        "name": name[:200],
        "aliases": [],
        "description": description[:500],
        "category": category,
        "severity": severity,
        "citation": citation,
        "act": "Traffic Act Cap 403",
        "section": f"Section {section}",
        "min_fine": fine[0] if fine else 0,
        "max_fine": fine[1] if fine else 0,
        "max_imprisonment": imprisonment_str,
        "course_of_action": generate_course_of_action(section_text, severity),
        "law_version": LAW_VERSION,
    }


def _extract_description(section_title: str, section_text: str) -> str:
    """Extract a human-readable description from the section text."""
    # Remove page numbers, headers, footers
    text = re.sub(r"^\d+\s*$", "", section_text, flags=re.MULTILINE)
    text = re.sub(r"Cap\.\s*\d+.*?www\.kenyalaw\.org.*$", "", text, flags=re.IGNORECASE | re.MULTILINE)

    # Find the first substantive sentence after the section header
    lines = text.split("\n")
    meaningful_lines = [
        l.strip() for l in lines
        if l.strip()
        and not re.match(r"^\d+[A-Za-z]?\.", l.strip())  # skip section numbers
        and not re.match(r"^\d+\s*$", l.strip())  # skip standalone page numbers
        and len(l.strip()) > 20  # skip short fragments
    ]

    if meaningful_lines:
        desc = " ".join(meaningful_lines[:3])
        # Clean up
        desc = re.sub(r"\s+", " ", desc).strip()
        return desc

    return section_title


def fetch_html_source(url: str) -> str | None:
    """Fetch the HTML version of the Act from Kenya Law."""
    import requests

    logger.info(f"Fetching HTML from {url}")
    try:
        resp = requests.get(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; SheriaCheck/1.0; +https://sheriacheck.ke)"
            },
            timeout=30,
        )
        resp.raise_for_status()
        return resp.text
    except requests.RequestException as e:
        logger.warning(f"Failed to fetch HTML: {e}")
        return None


def parse_html(html_content: str) -> list[dict[str, Any]]:
    """Parse HTML version of the Act (Akoma Ntoso format)."""
    from bs4 import BeautifulSoup

    logger.info("Parsing HTML content...")
    soup = BeautifulSoup(html_content, "html.parser")

    # Try to find the document content
    content_div = soup.select_one(".document-content, #document-content, [data-component='DocumentContent']")
    if not content_div:
        content_div = soup.find("main") or soup.find("body")

    if not content_div:
        logger.warning("Could not find document content in HTML")
        return []

    text = content_div.get_text(separator="\n")

    # Split into sections
    offenses = []
    sections = re.split(r"(?:^|\n)(\d+[A-Za-z]?\.\s+[A-Z][^.\n]{10,100}?)\.{3,}", text, flags=re.MULTILINE)

    current_section = ""
    for i, part in enumerate(sections):
        part = part.strip()
        if not part:
            continue

        if re.match(r"^\d+[A-Za-z]?\.\s+[A-Z]", part):
            current_section = part
        elif current_section and re.search(r"(?:fine|penalty|imprisonment)", part, re.IGNORECASE):
            # Find the section number from current_section
            match = re.match(r"^(\d+[A-Za-z]?)\.\s+(.+)$", current_section)
            if match:
                offense = _build_offense(
                    section_num=match.group(1),
                    section_title=match.group(2),
                    section_text=current_section + "\n" + part,
                )
                if offense:
                    offenses.append(offense)

    logger.info(f"Extracted {len(offenses)} offenses from HTML")
    return offenses


def fetch_pdf_source(url: str, output_path: str) -> str | None:
    """Download the PDF version of the Act."""
    import requests

    logger.info(f"Downloading PDF from {url}")
    try:
        resp = requests.get(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; SheriaCheck/1.0; +https://sheriacheck.ke)"
            },
            timeout=60,
            stream=True,
        )
        resp.raise_for_status()

        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
        with open(output_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)

        logger.info(f"PDF downloaded to {output_path} ({os.path.getsize(output_path)} bytes)")
        return output_path
    except requests.RequestException as e:
        logger.warning(f"Failed to download PDF: {e}")
        return None


# ─── Main Pipeline ────────────────────────────────────────────────────

def scrape(source: str = "auto", pdf_path: str | None = None, output_path: str | None = None) -> list[dict[str, Any]]:
    """
    Main scraping pipeline.

    Args:
        source: "auto", "html", "pdf", or "cache"
        pdf_path: Path to local PDF file
        output_path: Path to write output JSON

    Returns:
        List of offense dictionaries
    """
    offenses: list[dict[str, Any]] = []

    if source == "auto":
        # Try HTML first, fall back to PDF
        logger.info("Source: auto — trying HTML first")
        html = fetch_html_source(KENYA_LAW_HTML_URL)
        if html:
            offenses = parse_html(html)
        else:
            logger.info("HTML unavailable, trying PDF download")
            local_pdf = pdf_path or "/tmp/traffic_act_scraped.pdf"
            downloaded = fetch_pdf_source(KENYA_LAW_PDF_URL, local_pdf)
            if downloaded:
                offenses = parse_pdf(downloaded)

        # If all online sources failed, try local PDF candidates
        if not offenses:
            for candidate in LOCAL_PDF_CANDIDATES:
                if candidate.exists():
                    logger.info(f"Online sources blocked, using local PDF: {candidate}")
                    offenses = parse_pdf(str(candidate))
                    if offenses:
                        break

    elif source == "html":
        html = fetch_html_source(KENYA_LAW_HTML_URL)
        if html:
            offenses = parse_html(html)

    elif source == "pdf":
        if pdf_path and os.path.exists(pdf_path):
            offenses = parse_pdf(pdf_path)
        else:
            local_pdf = "/tmp/traffic_act_scraped.pdf"
            downloaded = fetch_pdf_source(KENYA_LAW_PDF_URL, local_pdf)
            if downloaded:
                offenses = parse_pdf(downloaded)

    elif source == "cache":
        # Load from previously generated file
        cache_path = output_path or str(DEFAULT_OUTPUT)
        if os.path.exists(cache_path):
            with open(cache_path) as f:
                offenses = json.load(f)
            logger.info(f"Loaded {len(offenses)} offenses from cache: {cache_path}")
        else:
            logger.error(f"No cache file found at {cache_path}")

    else:
        logger.error(f"Unknown source: {source}")
        sys.exit(1)

    if not offenses:
        logger.warning("No offenses extracted from any source")
        return []

    # Deduplicate by ID (keep the one with more complete data)
    seen: dict[str, dict[str, Any]] = {}
    for o in offenses:
        oid = o["id"]
        if oid in seen:
            existing = seen[oid]
            # Keep the one with higher max_fine (more specific)
            if o["max_fine"] > existing["max_fine"]:
                seen[oid] = o
        else:
            seen[oid] = o

    offenses = list(seen.values())

    # Sort by section number
    def section_sort_key(o: dict) -> tuple[int, str]:
        m = re.search(r"Section\s+(\d+)", o.get("section", ""))
        return (int(m.group(1)) if m else 999, o.get("name", ""))

    offenses.sort(key=section_sort_key)

    # Write output
    output = output_path or str(DEFAULT_OUTPUT)
    os.makedirs(os.path.dirname(output) or ".", exist_ok=True)
    with open(output, "w") as f:
        json.dump(offenses, f, indent=2, ensure_ascii=False)

    logger.info(f"✓ Written {len(offenses)} offenses to {output}")

    # Print summary
    categories: dict[str, int] = {}
    severities: dict[str, int] = {}
    for o in offenses:
        categories[o["category"]] = categories.get(o["category"], 0) + 1
        severities[o["severity"]] = severities.get(o["severity"], 0) + 1

    print("\n── Scrape Summary ──")
    print(f"Total offenses: {len(offenses)}")
    print(f"Categories: {dict(categories)}")
    print(f"Severities: {dict(severities)}")
    print(f"Output: {output}")

    return offenses


def main():
    parser = argparse.ArgumentParser(description="Scrape Traffic Act for Sheria Check")
    parser.add_argument(
        "--source",
        choices=["auto", "html", "pdf", "cache"],
        default="auto",
        help="Data source (default: auto — try HTML then PDF)",
    )
    parser.add_argument("--pdf", help="Path to local PDF file")
    parser.add_argument(
        "--output",
        help=f"Output JSON path (default: {DEFAULT_OUTPUT})",
    )
    parser.add_argument("--verbose", action="store_true", help="Enable debug logging")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
    )

    scrape(source=args.source, pdf_path=args.pdf, output_path=args.output)


if __name__ == "__main__":
    main()
