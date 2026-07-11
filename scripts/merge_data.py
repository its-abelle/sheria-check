#!/usr/bin/env python3
"""
Sheria Check — Data Merge Pipeline

Combines multiple scraped data sources into a single unified dataset:
  1. Traffic Act (Cap 403) — seed_data_full.json
  2. Subsidiary legislation — seed_data_subsidiary.json
  3. (Future) NTSA portal manual data
  4. (Future) County by-laws

Handles deduplication, conflict resolution, and category validation.

Usage:
    python scripts/merge_data.py
    python scripts/merge_data.py --output scripts/seed_data_unified.json
    python scripts/merge_data.py --sources scripts/seed_data_full.json scripts/seed_data_subsidiary.json
"""

import argparse
import json
import logging
import os
import re
import sys
from pathlib import Path
from typing import Any

logger = logging.getLogger("sheria_merge")

DEFAULT_SOURCES = [
    Path(__file__).parent / "seed_data_full.json",
    Path(__file__).parent / "seed_data_subsidiary.json",
]
DEFAULT_OUTPUT = Path(__file__).parent / "seed_data_unified.json"

VALID_CATEGORIES = {
    "speeding-reckless", "license-documents", "vehicle-condition",
    "traffic-rules", "parking-loading", "alcohol-drugs",
}
VALID_SEVERITIES = {"minor", "serious", "felony"}

# Conflict resolution: when two sources have the same offense ID,
# which source wins? Higher number = higher priority.
SOURCE_PRIORITY = {
    "traffic-act": 100,       # Primary source
    "ntsa-act": 90,
    "psv-regulations": 85,
    "kenya-roads-act": 80,
    "speed-limiter-regs": 75,
    "school-zones": 70,
    "county-by-laws": 50,
}


def infer_source_id(offense: dict[str, Any]) -> str:
    """Try to determine which source an offense came from based on its ID or act."""
    oid = offense.get("id", "")
    act = offense.get("act", "")

    if "ntsa" in oid or "psv" in oid:
        if "tout" in oid or "conductor" in oid or "route" in oid or "fare" in oid:
            return "psv-regulations"
        return "ntsa-act"
    if "speed-limiter" in oid or "speed-governor" in oid or "no-speed" in oid:
        return "speed-limiter-regs"
    if "toll" in oid or "overweight" in oid or "road-reserve" in oid:
        return "kenya-roads-act"
    if "school" in oid or "school-zone" in oid:
        return "school-zones"
    if "Traffic Act" in act:
        return "traffic-act"

    return "traffic-act"  # Default


def load_source(path: str) -> list[dict[str, Any]]:
    """Load a JSON source file."""
    p = Path(path)
    if not p.exists():
        logger.warning(f"Source not found: {path}")
        return []

    with open(p) as f:
        data = json.load(f)

    if not isinstance(data, list):
        logger.warning(f"Source {path} is not a JSON array, skipping")
        return []

    logger.info(f"Loaded {len(data)} offenses from {path}")
    return data


def validate_offense(o: dict[str, Any], source_name: str = "unknown") -> list[str]:
    """Validate an offense record. Returns list of issues."""
    issues = []
    required = ["id", "name", "aliases", "description", "category", "severity",
                 "citation", "act", "section", "min_fine", "max_fine", "course_of_action"]

    for field in required:
        if field not in o:
            issues.append(f"Missing '{field}' in {o.get('id', '?')}")

    if o.get("category") not in VALID_CATEGORIES:
        issues.append(f"Invalid category '{o.get('category')}' in {o.get('id', '?')}")

    if o.get("severity") not in VALID_SEVERITIES:
        issues.append(f"Invalid severity '{o.get('severity')}' in {o.get('id', '?')}")

    if o.get("min_fine", 0) > o.get("max_fine", 0):
        issues.append(f"min_fine > max_fine in {o.get('id', '?')}")

    return issues


def merge(sources: list[str], output: str | None = None) -> list[dict[str, Any]]:
    """Merge multiple data sources into one unified dataset."""
    all_offenses: list[dict[str, Any]] = []
    total_validation_issues = 0

    for source_path in sources:
        offenses = load_source(source_path)
        for o in offenses:
            issues = validate_offense(o, str(source_path))
            if issues:
                total_validation_issues += len(issues)
                for iss in issues:
                    logger.warning(f"  Validation: {iss}")
            all_offenses.append(o)

    # Deduplicate by ID with conflict resolution
    merged: dict[str, dict[str, Any]] = {}

    for o in all_offenses:
        oid = o.get("id", "")
        if not oid:
            continue

        source_id = infer_source_id(o)
        priority = SOURCE_PRIORITY.get(source_id, 50)

        if oid not in merged:
            o["_source"] = source_id
            o["_priority"] = priority
            merged[oid] = o
        else:
            existing = merged[oid]
            existing_priority = existing.get("_priority", 50)

            # Higher priority wins
            if priority > existing_priority:
                o["_source"] = source_id
                o["_priority"] = priority
                merged[oid] = o
                logger.debug(f"  Conflict: {oid} — {source_id} overrides {existing.get('_source')}")
            elif priority == existing_priority:
                # Same priority — merge aliases
                existing_aliases = set(existing.get("aliases", []))
                new_aliases = set(o.get("aliases", []))
                merged_aliases = list(existing_aliases | new_aliases)
                if len(merged_aliases) > len(existing_aliases):
                    existing["aliases"] = merged_aliases
                    logger.debug(f"  Merged aliases for {oid}: {len(merged_aliases)} total")

    # Remove internal fields and sort
    result = []
    for o in merged.values():
        o.pop("_source", None)
        o.pop("_priority", None)
        result.append(o)

    # Sort by section (numeric) then by name
    def sort_key(o: dict) -> tuple:
        m = re.search(r"(\d+)", o.get("section", ""))
        return (int(m.group(1)) if m else 999, o.get("section", ""), o.get("name", ""))

    result.sort(key=sort_key)

    # Write output
    output_path = output or str(DEFAULT_OUTPUT)
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    # Summary
    categories: dict[str, int] = {}
    severities: dict[str, int] = {}
    for o in result:
        categories[o["category"]] = categories.get(o["category"], 0) + 1
        severities[o["severity"]] = severities.get(o["severity"], 0) + 1

    print(f"\n── Merge Summary ──")
    print(f"Input sources: {len(sources)} ({sum(len(load_source(s)) for s in sources)} raw offenses)")
    print(f"After dedup:   {len(result)} unique offenses")
    print(f"Validation issues: {total_validation_issues}")
    print(f"Categories: {dict(categories)}")
    print(f"Severities: {dict(severities)}")
    print(f"Output: {output_path}")

    return result


def main():
    parser = argparse.ArgumentParser(description="Merge scraped offense data sources")
    parser.add_argument(
        "--sources",
        nargs="+",
        default=[str(s) for s in DEFAULT_SOURCES],
        help=f"Source JSON files (default: {[str(s) for s in DEFAULT_SOURCES]})",
    )
    parser.add_argument("--output", help=f"Output path (default: {DEFAULT_OUTPUT})")
    parser.add_argument("--verbose", action="store_true", help="Enable debug logging")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
    )

    merge(sources=args.sources, output=args.output)


if __name__ == "__main__":
    main()
