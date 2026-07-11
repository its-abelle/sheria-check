#!/usr/bin/env python3
"""
Sheria Check — Data Verification Script

Cross-references scraped offense data against known reference values
to flag discrepancies, missing data, and potential errors.

Usage:
    python scripts/verify_data.py
    python scripts/verify_data.py --data scripts/seed_data_full.json
    python scripts/verify_data.py --strict
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Any

DEFAULT_DATA = Path(__file__).parent / "seed_data_full.json"

# Known reference values for validation
REFERENCE_OFFENSES: list[dict[str, Any]] = [
    {
        "name": "Driving under influence of alcohol/drugs",
        "section": "Section 44",
        "max_fine": 100_000,
        "severity": "felony",
    },
    {
        "name": "Dangerous driving",
        "section": "Section 46",
        "max_fine": 100_000,
        "severity": "serious",
    },
    {
        "name": "Careless driving",
        "section": "Section 47",
        "max_fine": 100_000,
        "severity": "serious",
    },
    {
        "name": "Exceeding speed limit",
        "section": "Section 42",
        "max_fine": 100_000,
        "severity": "minor",
    },
    {
        "name": "Driving without reasonable consideration",
        "section": "Section 47",
        "severity": "serious",
    },
    {
        "name": "General penalty",
        "section": "Section 118",
        "max_fine": 100_000,
        "severity": "minor",
    },
]

VALID_CATEGORIES = {
    "speeding-reckless", "license-documents", "vehicle-condition",
    "traffic-rules", "parking-loading", "alcohol-drugs",
}

VALID_SEVERITIES = {"minor", "serious", "felony"}


def verify(data_path: str, strict: bool = False) -> list[str]:
    """Run verification checks on the dataset. Returns list of issues found."""
    path = Path(data_path)
    if not path.exists():
        return [f"File not found: {data_path}"]

    with open(path) as f:
        offenses = json.load(f)

    if not isinstance(offenses, list):
        return ["Data is not a JSON array"]

    issues: list[str] = []

    # Structural checks
    if not offenses:
        issues.append("Empty dataset — no offenses found")
        return issues

    required_fields = [
        "id", "name", "aliases", "description", "category",
        "severity", "citation", "act", "section",
        "min_fine", "max_fine", "course_of_action", "law_version",
    ]

    seen_ids: set[str] = set()
    seen_sections: set[str] = set()

    for i, o in enumerate(offenses):
        idx = f"#{i} ({o.get('name', 'unknown')[:50]})"

        # Required fields
        for field in required_fields:
            if field not in o:
                issues.append(f"{idx}: missing required field '{field}'")

        # ID uniqueness
        oid = o.get("id", "")
        if oid in seen_ids:
            issues.append(f"{idx}: duplicate id '{oid}'")
        seen_ids.add(oid)

        # Category
        cat = o.get("category", "")
        if cat not in VALID_CATEGORIES:
            issues.append(f"{idx}: invalid category '{cat}'")

        # Severity
        sev = o.get("severity", "")
        if sev not in VALID_SEVERITIES:
            issues.append(f"{idx}: invalid severity '{sev}'")

        # Fine amounts
        min_f = o.get("min_fine", -1)
        max_f = o.get("max_fine", -1)
        if min_f < 0:
            issues.append(f"{idx}: negative min_fine")
        if max_f < min_f:
            issues.append(f"{idx}: max_fine ({max_f}) < min_fine ({min_f})")
        if max_f == 0 and min_f == 0:
            issues.append(f"{idx}: both fines are 0 — check for missing data")

        # Section reference
        sec = o.get("section", "")
        if sec:
            if sec in seen_sections:
                issues.append(f"{idx}: duplicate section '{sec}'")
            seen_sections.add(sec)
        else:
            issues.append(f"{idx}: missing section reference")

        # Course of action
        coa = o.get("course_of_action", "")
        if len(coa) < 20:
            issues.append(f"{idx}: course_of_action is too short ({len(coa)} chars)")

        # Citations
        cit = o.get("citation", "")
        if cit and "Cap." not in cit and "Act" not in cit:
            issues.append(f"{idx}: citation doesn't reference Cap. or Act")

    # Cross-reference known values
    for ref in REFERENCE_OFFENSES:
        matches = [
            o for o in offenses
            if ref.get("name", "").lower() in o.get("name", "").lower()
            or ref.get("section", "").lower() in o.get("section", "").lower()
        ]
        if not matches:
            issues.append(f"MISSING: Known offense '{ref['name']}' ({ref.get('section')}) not found in scraped data")
            continue

        for match in matches:
            if "max_fine" in ref and match.get("max_fine", 0) != ref["max_fine"]:
                issues.append(
                    f"MISMATCH: {match['name']} — expected max_fine={ref['max_fine']}, "
                    f"got {match.get('max_fine')}"
                )
            if "severity" in ref and match.get("severity") != ref["severity"]:
                issues.append(
                    f"MISMATCH: {match['name']} — expected severity='{ref['severity']}', "
                    f"got '{match.get('severity')}'"
                )

    # Category coverage
    categories_found = {o.get("category") for o in offenses}
    missing_cats = VALID_CATEGORIES - categories_found
    if missing_cats:
        issues.append(f"Missing categories: {missing_cats}")

    # Summary stats
    issues.append(f"\n── Verification Summary ──")
    issues.append(f"Total offenses: {len(offenses)}")
    issues.append(f"Issues found: {len([i for i in issues if not i.startswith('──') and not i.startswith('Total')])}")
    issues.append(f"Categories: {dict((c, sum(1 for o in offenses if o.get('category') == c)) for c in sorted(categories_found))}")
    issues.append(f"Severities: {dict((s, sum(1 for o in offenses if o.get('severity') == s)) for s in sorted({o.get('severity') for o in offenses}))}")

    return issues


def main():
    parser = argparse.ArgumentParser(description="Verify scraped Traffic Act data")
    parser.add_argument(
        "--data",
        default=str(DEFAULT_DATA),
        help=f"Path to scraped JSON data (default: {DEFAULT_DATA})",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Exit with error if any issues found",
    )
    args = parser.parse_args()

    issues = verify(args.data, strict=args.strict)

    for issue in issues:
        print(issue)

    critical = [i for i in issues if not i.startswith("──")]
    if args.strict and critical:
        sys.exit(1)


if __name__ == "__main__":
    main()
