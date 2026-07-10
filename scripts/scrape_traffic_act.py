#!/usr/bin/env python3
"""
Scrape the Traffic Act (Cap 403) from Kenya Law to extract offenses and penalties.

Usage:
    python scripts/scrape_traffic_act.py

Output:
    scripts/seed_data.json  -- ready to POST to /api/admin/offenses/bulk
"""

import json
import re
import sys
from pathlib import Path

import requests
from bs4 import BeautifulSoup

# Kenya Law URL for the Traffic Act
TRAFFIC_ACT_URL = "http://kenyalaw.org:8181/exist/kenyalex/actview.xql?actid=Cap.%20403"

CATEGORY_MAP = {
    "speeding": "speeding-reckless",
    "speed": "speeding-reckless",
    "dangerous": "speeding-reckless",
    "reckless": "speeding-reckless",
    "license": "license-documents",
    "licence": "license-documents",
    "driving without": "license-documents",
    "insurance": "license-documents",
    "tire": "vehicle-condition",
    "tyre": "vehicle-condition",
    "light": "vehicle-condition",
    "brake": "vehicle-condition",
    "vehicle condition": "vehicle-condition",
    "overtaking": "traffic-rules",
    "traffic light": "traffic-rules",
    "traffic sign": "traffic-rules",
    "parking": "parking-loading",
    "park": "parking-loading",
    "overload": "parking-loading",
    "alcohol": "alcohol-drugs",
    "drink": "alcohol-drugs",
    "drug": "alcohol-drugs",
    "intoxicat": "alcohol-drugs",
}

SEVERITY_KEYWORDS = {
    "felony": ["imprisonment for", "life imprisonment", "14 years", "10 years", "7 years", "5 years", "3 years"],
    "serious": ["2 years", "18 months", "12 months", "6 months"],
}


def classify_category(text: str) -> str:
    text_lower = text.lower()
    for keyword, category in CATEGORY_MAP.items():
        if keyword in text_lower:
            return category
    return "traffic-rules"


def classify_severity(text: str) -> str:
    text_lower = text.lower()
    for severity, keywords in SEVERITY_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                return severity
    return "minor"


def parse_fine_amount(text: str) -> tuple[int, int]:
    """Extract min and max fine from text like 'not exceeding five thousand shillings'."""
    number_map = {
        "five hundred": 500,
        "one thousand": 1000,
        "two thousand": 2000,
        "three thousand": 3000,
        "five thousand": 5000,
        "ten thousand": 10000,
        "twenty thousand": 20000,
        "fifty thousand": 50000,
        "one hundred thousand": 100000,
        "two hundred thousand": 200000,
    }

    text_lower = text.lower()
    amounts = []

    for phrase, value in number_map.items():
        if phrase in text_lower:
            amounts.append(value)

    # Also try to match numeric patterns like "KES 5,000" or "5,000 shillings"
    numeric_matches = re.findall(r"(?:KES\s*)?(\d{1,3}(?:,\d{3})*)\s*(?:shillings|/-)?", text_lower)
    for m in numeric_matches:
        amounts.append(int(m.replace(",", "")))

    if not amounts:
        return (500, 5000)  # reasonable default if parsing fails

    return (min(amounts), max(amounts))


def parse_imprisonment(text: str) -> str | None:
    """Extract imprisonment term like 'imprisonment for 2 years'."""
    match = re.search(r"imprisonment\s+for\s+([\w\s]+)", text.lower())
    if match:
        return match.group(1).strip()
    return None


def scrape():
    print(f"Fetching {TRAFFIC_ACT_URL}...")
    resp = requests.get(TRAFFIC_ACT_URL, timeout=30)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")
    body = soup.get_text()

    # Split into sections (rough heuristic)
    sections = re.split(r"(Section\s+\d+[A-Za-z]?\.)", body)
    sections = [s.strip() for s in sections if s.strip()]

    offenses = []
    current_section = ""

    for part in sections:
        if part.startswith("Section"):
            current_section = part
            continue

        text = part
        # Look for penalty-related content
        if not any(kw in text.lower() for kw in ["offence", "penalty", "fine", "guilty", "imprisonment", "shilling"]):
            continue

        # Extract a title from the first line or sentence
        title_match = re.search(r"([A-Z][^.]{10,100}\.)", text)
        title = title_match.group(1).strip() if title_match else f"Offense under {current_section}"

        # Generate a stable ID
        offense_id = title.lower().replace(" ", "-").replace("/", "-")
        offense_id = re.sub(r"[^a-z0-9-]", "", offense_id)[:50]

        min_fine, max_fine = parse_fine_amount(text)
        imprisonment = parse_imprisonment(text)
        severity = classify_severity(text)
        category = classify_category(title)

        offense = {
            "id": offense_id or f"offense-{len(offenses)}",
            "name": title[:200],
            "aliases": [],
            "description": text[:500].strip(),
            "category": category,
            "severity": severity,
            "citation": f"Traffic Act Cap 403, {current_section}".strip(),
            "act": "Traffic Act Cap 403",
            "section": current_section.strip(),
            "min_fine": min_fine,
            "max_fine": max_fine,
            "max_imprisonment": imprisonment,
            "course_of_action": "The officer should issue a charge sheet. Do not pay on the spot. Plead guilty or appear in court on the date specified." if severity == "minor"
            else "This is a criminal offense. You may be arrested. Do not attempt to settle on the spot. Contact a lawyer immediately."
            if severity == "felony"
            else "This is a serious offense. The officer must issue a charge sheet. Do not pay on the spot. Consider seeking legal representation.",
            "law_version": "2024",
        }

        offenses.append(offense)

    # Write output
    output_path = Path(__file__).parent / "seed_data.json"
    with open(output_path, "w") as f:
        json.dump(offenses, f, indent=2)

    print(f"Extracted {len(offenses)} offenses → {output_path}")
    return offenses


if __name__ == "__main__":
    scrape()
