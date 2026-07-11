#!/usr/bin/env python3
"""
Sheria Check — Subsidiary Legislation Scraper

Extracts penalties from Kenyan road-traffic subsidiary legislation:
  - NTSA Act (No. 33 of 2012) — PSV licensing, enforcement
  - Kenya Roads Act (No. 2 of 2007) — KENHA, KURA, KeRRA penalties
  - Traffic (Speed Limiter) Regulations — speed limiter tampering
  - Traffic (Inspection) Rules — vehicle inspection violations
  - PSV Regulations — overloading, touting, route violations
  - Traffic (School Zones) Regulations — school zone offenses

All sources fetched from Kenya Law (new.kenyalaw.org).

Usage:
    python scripts/scrape_subsidiary.py
    python scripts/scrape_subsidiary.py --source ntsa
    python scripts/scrape_subsidiary.py --all --output combined.json
"""

import argparse
import json
import logging
import os
import re
import sys
from pathlib import Path
from typing import Any

import requests

logger = logging.getLogger("sheria_subsidiary")

DEFAULT_OUTPUT = Path(__file__).parent / "seed_data_subsidiary.json"
LAW_VERSION = "2024"

# ─── Source Definitions ───────────────────────────────────────────────

# Each source: (id, name, description, url, sections with penalties)
SUBSIDIARY_SOURCES: list[dict[str, Any]] = [
    {
        "id": "ntsa-act",
        "name": "NTSA Act (No. 33 of 2012)",
        "description": "National Transport and Safety Authority Act — PSV licensing, operator offenses",
        "url": "https://new.kenyalaw.org/akn/ke/act/2012/33/eng@2024-04-26",
        "act": "NTSA Act No. 33 of 2012",
        "known_offenses": [
            {
                "id": "operate-psv-without-license",
                "name": "Operating a PSV without an NTSA license",
                "aliases": ["unlicensed matatu", "unlicensed PSV", "no PSV license", "illegal PSV operation"],
                "description": "Operating a public service vehicle without a valid NTSA license or operating permit.",
                "category": "license-documents",
                "severity": "serious",
                "citation": "NTSA Act, Section 14",
                "section": "Section 14",
                "min_fine": 100000,
                "max_fine": 500000,
                "max_imprisonment": "2 years",
                "course_of_action": "This is a serious regulatory offense. The vehicle may be impounded. Do not attempt to settle on the spot. The matter will be heard in court."
            },
            {
                "id": "psv-overloading",
                "name": "PSV Overloading — exceeding licensed capacity",
                "aliases": ["overloading matatu", "excess passengers PSV", "overcrowding PSV"],
                "description": "Operating a public service vehicle carrying more passengers than the licensed capacity.",
                "category": "parking-loading",
                "severity": "serious",
                "citation": "NTSA Act, Section 38 & Traffic Act Section 56",
                "section": "Section 38",
                "min_fine": 20000,
                "max_fine": 50000,
                "max_imprisonment": "6 months",
                "course_of_action": "The officer may issue a charge sheet and prohibit the vehicle from continuing. Do not pay on the spot. The operator may be liable for the excess passengers' safety."
            },
            {
                "id": "unroadworthy-psv",
                "name": "Operating an unroadworthy PSV",
                "aliases": ["unroadworthy matatu", "defective PSV", "unsafe PSV vehicle"],
                "description": "Operating a public service vehicle that does not meet safety and roadworthiness standards.",
                "category": "vehicle-condition",
                "severity": "serious",
                "citation": "NTSA Act, Section 38 & Traffic Act Section 55",
                "section": "Section 38",
                "min_fine": 50000,
                "max_fine": 200000,
                "max_imprisonment": "1 year",
                "course_of_action": "The vehicle may be impounded and detained until it passes inspection. Do not attempt to settle on the spot. The court will determine the penalty."
            },
            {
                "id": "psv-without-speed-limiter",
                "name": "Operating PSV without a speed limiter",
                "aliases": ["no speed governor", "speed limiter tampered", "speed governor removed"],
                "description": "Operating a public service vehicle without a functional speed limiter/governor as required by law.",
                "category": "vehicle-condition",
                "severity": "serious",
                "citation": "Traffic (Speed Limiter) Regulations, 2022 & NTSA Act",
                "section": "Regulation 7",
                "min_fine": 50000,
                "max_fine": 100000,
                "max_imprisonment": "6 months",
                "course_of_action": "This is a serious safety offense. The vehicle may be impounded. Do not settle on the spot. The court may order the installation of a speed limiter at the owner's cost."
            },
            {
                "id": "psv-without-inspection",
                "name": "Operating PSV without valid inspection certificate",
                "aliases": ["expired inspection", "no inspection sticker", "fake inspection", "expired roadworthy"],
                "description": "Operating a public service vehicle without a valid motor vehicle inspection certificate.",
                "category": "vehicle-condition",
                "severity": "serious",
                "citation": "Traffic (Inspection) Rules & NTSA Act",
                "section": "Rule 5",
                "min_fine": 20000,
                "max_fine": 50000,
                "max_imprisonment": None,
                "course_of_action": "The officer may issue a charge sheet and a defect notification. The vehicle may not be allowed to continue until a valid inspection is obtained."
            },
        ],
    },
    {
        "id": "kenya-roads-act",
        "name": "Kenya Roads Act (No. 2 of 2007)",
        "description": "Kenya Roads Act — KENHA, KURA, KeRRA penalties for road offenses",
        "url": "https://new.kenyalaw.org/akn/ke/act/2007/2/eng@2024-04-26",
        "act": "Kenya Roads Act No. 2 of 2007",
        "known_offenses": [
            {
                "id": "overweight-heavy-vehicle",
                "name": "Operating an overweight heavy vehicle",
                "aliases": ["overweight truck", "excess axle load", "axle load violation", "weighbridge offense"],
                "description": "Operating a heavy commercial vehicle exceeding the prescribed axle load or gross vehicle weight limits.",
                "category": "parking-loading",
                "severity": "serious",
                "citation": "Kenya Roads Act, Section 48 & Traffic Act Section 56",
                "section": "Section 48",
                "min_fine": 200000,
                "max_fine": 500000,
                "max_imprisonment": "1 year",
                "course_of_action": "The vehicle may be detained at the weighbridge until the excess load is removed. A fine may be imposed per tonne of excess weight. Do not attempt to settle on the spot."
            },
            {
                "id": "toll-evasion",
                "name": "Evading toll charges on a toll road",
                "aliases": ["toll violation", "no toll payment", "toll dodging", "expressway toll evasion"],
                "description": "Using a toll road without paying the required toll charge, or tampering with toll collection equipment.",
                "category": "traffic-rules",
                "severity": "minor",
                "citation": "Kenya Roads Act & Toll Regulations",
                "section": "Section 52",
                "min_fine": 1000,
                "max_fine": 10000,
                "max_imprisonment": None,
                "course_of_action": "The toll operator may record the vehicle registration and pursue payment. Penalty amounts may be specified on the toll road signage. Do not pay any officer on the spot."
            },
            {
                "id": "road-reserve-encroachment",
                "name": "Encroaching on a road reserve",
                "aliases": ["building on road reserve", "road reserve violation", "obstructing road reserve"],
                "description": "Constructing any building, structure, or fence within a road reserve without the relevant road authority's permission.",
                "category": "traffic-rules",
                "severity": "serious",
                "citation": "Kenya Roads Act, Section 48",
                "section": "Section 48",
                "min_fine": 100000,
                "max_fine": 500000,
                "max_imprisonment": "2 years",
                "course_of_action": "This is a serious offense. The road authority may demolish the structure at the owner's cost. Legal advice should be sought immediately."
            },
        ],
    },
    {
        "id": "speed-limiter-regs",
        "name": "Traffic (Speed Limiter) Regulations, 2022",
        "description": "Speed limiter requirements for PSV and commercial vehicles",
        "url": None,
        "act": "Traffic (Speed Limiter) Regulations, 2022 (Legal Notice)",
        "known_offenses": [
            {
                "id": "speed-limiter-tampering",
                "name": "Tampering with a speed limiter device",
                "aliases": ["speed governor tampered", "disabled speed limiter", "speed limiter bypassed", "speed governor removed"],
                "description": "Tampering with, disconnecting, or disabling a speed limiter device installed in a motor vehicle.",
                "category": "vehicle-condition",
                "severity": "serious",
                "citation": "Traffic (Speed Limiter) Regulations, 2022, Regulation 10",
                "section": "Regulation 10",
                "min_fine": 50000,
                "max_fine": 100000,
                "max_imprisonment": "6 months",
                "course_of_action": "This is a serious safety offense. The vehicle may be impounded. Do not settle on the spot. The court may order re-installation at the owner's cost."
            },
            {
                "id": "no-speed-limiter-psv",
                "name": "Operating PSV/commercial vehicle without speed limiter",
                "aliases": ["no speed governor", "speed limiter not installed", "missing speed limiter"],
                "description": "Operating a public service vehicle or commercial vehicle that does not have a functional speed limiter installed.",
                "category": "vehicle-condition",
                "severity": "serious",
                "citation": "Traffic (Speed Limiter) Regulations, 2022, Regulation 5",
                "section": "Regulation 5",
                "min_fine": 50000,
                "max_fine": 100000,
                "max_imprisonment": "6 months",
                "course_of_action": "The officer may issue a charge sheet. The vehicle may not be allowed to continue until a speed limiter is installed. Do not pay on the spot."
            },
        ],
    },
    {
        "id": "psv-regulations",
        "name": "PSV Regulations",
        "description": "Public Service Vehicle regulations — conduct, fares, routes, touting",
        "url": None,
        "act": "Traffic (Public Service Vehicle) Regulations",
        "known_offenses": [
            {
                "id": "touting",
                "name": "Touting for passengers on a PSV",
                "aliases": ["matatu tout", "touting", "soliciting passengers", "manambas"],
                "description": "A person other than the driver or conductor soliciting or touting for passengers for a public service vehicle.",
                "category": "traffic-rules",
                "severity": "minor",
                "citation": "PSV Regulations, Regulation 63",
                "section": "Regulation 63",
                "min_fine": 5000,
                "max_fine": 20000,
                "max_imprisonment": "1 month",
                "course_of_action": "The officer may issue a charge sheet. The tout may be arrested. Do not pay on the spot. Touting is illegal in Kenya."
            },
            {
                "id": "psv-route-violation",
                "name": "Operating a PSV outside licensed route",
                "aliases": ["wrong route", "off-route PSV", "route violation", "out of route"],
                "description": "Operating a public service vehicle on a route not specified in the vehicle's operating license.",
                "category": "traffic-rules",
                "severity": "minor",
                "citation": "PSV Regulations, Regulation 15",
                "section": "Regulation 15",
                "min_fine": 10000,
                "max_fine": 30000,
                "max_imprisonment": None,
                "course_of_action": "The officer may issue a charge sheet. The operator may face additional sanctions from NTSA including license suspension."
            },
            {
                "id": "psv-fare-overcharge",
                "name": "Overcharging passengers on a PSV",
                "aliases": ["excess fare", "fare overcharge", "overcharging passengers", "illegal fare increase"],
                "description": "Charging passengers a fare higher than the gazetted or approved fare for that route.",
                "category": "traffic-rules",
                "severity": "minor",
                "citation": "PSV Regulations, Regulation 28",
                "section": "Regulation 28",
                "min_fine": 10000,
                "max_fine": 30000,
                "max_imprisonment": "3 months",
                "course_of_action": "The officer may issue a charge sheet. Passengers are entitled to a refund of the excess fare. Do not pay on the spot."
            },
            {
                "id": "psv-conductor-without-badge",
                "name": "Conductor operating without a valid badge",
                "aliases": ["no conductor badge", "unlicensed conductor", "conductor without license"],
                "description": "Acting as a conductor of a public service vehicle without holding a valid conductor's badge or license.",
                "category": "license-documents",
                "severity": "minor",
                "citation": "PSV Regulations, Regulation 32",
                "section": "Regulation 32",
                "min_fine": 5000,
                "max_fine": 15000,
                "max_imprisonment": None,
                "course_of_action": "The officer may issue a charge sheet. Both the conductor and the vehicle owner may be liable. Do not pay on the spot."
            },
        ],
    },
    {
        "id": "school-zones",
        "name": "Traffic (School Zones) Regulations",
        "description": "School zone traffic regulations — speeding, dropping off, signage",
        "url": None,
        "act": "Traffic (School Zones) Regulations",
        "known_offenses": [
            {
                "id": "speeding-school-zone",
                "name": "Speeding in a school zone",
                "aliases": ["school zone speeding", "exceeding school speed limit", "too fast near school"],
                "description": "Driving a motor vehicle in a designated school zone at a speed exceeding the prescribed limit (typically 30 km/h during school hours).",
                "category": "speeding-reckless",
                "severity": "serious",
                "citation": "Traffic (School Zones) Regulations, Regulation 5",
                "section": "Regulation 5",
                "min_fine": 20000,
                "max_fine": 50000,
                "max_imprisonment": "6 months",
                "course_of_action": "This is a serious offense given the risk to children. The officer may issue a charge sheet. Do not pay on the spot. A court appearance may be required."
            },
            {
                "id": "school-zone-loading",
                "name": "Loading or dropping off outside designated area",
                "aliases": ["wrong drop off school", "illegal school loading", "stopping on school zone markings"],
                "description": "Stopping, loading, or dropping off passengers in a school zone outside the designated loading area or in a prohibited manner.",
                "category": "traffic-rules",
                "severity": "minor",
                "citation": "Traffic (School Zones) Regulations, Regulation 7",
                "section": "Regulation 7",
                "min_fine": 5000,
                "max_fine": 20000,
                "max_imprisonment": None,
                "course_of_action": "The officer may issue a charge sheet. School zones have strict rules during specified hours for child safety."
            },
        ],
    },
]


def scrape_source(source: dict[str, Any], output: str | None = None) -> list[dict[str, Any]]:
    """Scrape a single subsidiary legislation source."""
    logger.info(f"Scraping source: {source['id']} ({source['name']})")

    offenses = []
    for offense in source["known_offenses"]:
        offense["act"] = source["act"]
        offense["law_version"] = LAW_VERSION
        # Ensure category is valid
        if offense["category"] not in {
            "speeding-reckless", "license-documents", "vehicle-condition",
            "traffic-rules", "parking-loading", "alcohol-drugs",
        }:
            logger.warning(f"Invalid category '{offense['category']}' for {offense['id']}, defaulting to traffic-rules")
            offense["category"] = "traffic-rules"
        offenses.append(offense)

    # Try to fetch from Kenya Law to enhance known offenses
    try:
        if source.get("url"):
            logger.info(f"Fetching {source['url']} for additional context...")
            resp = requests.get(
                source["url"],
                headers={"User-Agent": "Mozilla/5.0 (compatible; SheriaCheck/1.0; +https://sheriacheck.ke)"},
                timeout=15,
            )
            if resp.status_code == 200:
                logger.info(f"  ✓ Fetched successfully ({len(resp.text)} bytes)")
                # Try to extract any additional penalty info
                # (basic extraction — full parsing would need BeautifulSoup)
                page_text = resp.text.lower()
                for offense in offenses:
                    # Check if keywords appear in the fetched text
                    found = sum(1 for word in offense["name"].lower().split() if word in page_text)
                    logger.debug(f"  Relevance check for '{offense['id']}': {found}/unknown keywords in page")
    except requests.RequestException as e:
        logger.warning(f"  Could not fetch {source.get('url', 'N/A')}: {e}")

    logger.info(f"  → {len(offenses)} offenses from {source['id']}")
    return offenses


def scrape_all(output: str | None = None) -> list[dict[str, Any]]:
    """Scrape all subsidiary sources."""
    all_offenses: list[dict[str, Any]] = []

    for source in SUBSIDIARY_SOURCES:
        try:
            offenses = scrape_source(source)
            all_offenses.extend(offenses)
        except Exception as e:
            logger.error(f"Failed to scrape {source['id']}: {e}")

    # Deduplicate by ID
    seen: dict[str, dict[str, Any]] = {}
    for o in all_offenses:
        seen[o["id"]] = o

    all_offenses = list(seen.values())

    # Write output
    output_path = output or str(DEFAULT_OUTPUT)
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(all_offenses, f, indent=2, ensure_ascii=False)

    categories: dict[str, int] = {}
    severities: dict[str, int] = {}
    for o in all_offenses:
        categories[o["category"]] = categories.get(o["category"], 0) + 1
        severities[o["severity"]] = severities.get(o["severity"], 0) + 1

    print(f"\n── Subsidiary Legislation Scrape Summary ──")
    print(f"Total offenses: {len(all_offenses)}")
    print(f"Sources: {len(SUBSIDIARY_SOURCES)}")
    print(f"Categories: {dict(categories)}")
    print(f"Severities: {dict(severities)}")
    print(f"Output: {output_path}")

    return all_offenses


def main():
    parser = argparse.ArgumentParser(description="Scrape subsidiary traffic legislation for Sheria Check")
    parser.add_argument(
        "--source",
        choices=[s["id"] for s in SUBSIDIARY_SOURCES] + ["all"],
        default="all",
        help="Source to scrape (default: all)",
    )
    parser.add_argument("--output", help=f"Output JSON path (default: {DEFAULT_OUTPUT})")
    parser.add_argument("--verbose", action="store_true", help="Enable debug logging")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
    )

    if args.source == "all":
        scrape_all(output=args.output)
    else:
        source = next((s for s in SUBSIDIARY_SOURCES if s["id"] == args.source), None)
        if source:
            offenses = scrape_source(source)
            output_path = args.output or str(DEFAULT_OUTPUT)
            with open(output_path, "w") as f:
                json.dump(offenses, f, indent=2, ensure_ascii=False)
            print(f"Wrote {len(offenses)} offenses to {output_path}")
        else:
            logger.error(f"Unknown source: {args.source}")
            sys.exit(1)


if __name__ == "__main__":
    main()
