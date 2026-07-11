#!/usr/bin/env python3
"""
Sheria Check — Data Import Script

Imports scraped offense data into the Sheria Check API.

Usage:
    python scripts/import_to_api.py
    python scripts/import_to_api.py --data scripts/seed_data_full.json
    python scripts/import_to_api.py --api http://localhost:4000/api/v1
    python scripts/import_to_api.py --token my_admin_token
    python scripts/import_to_api.py --dry-run  # Print without sending
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

import requests

DEFAULT_DATA = Path(__file__).parent / "seed_data_full.json"
DEFAULT_API = os.environ.get("SHERIA_API_URL", "http://localhost:4000/api/v1")
DEFAULT_TOKEN = os.environ.get("SHERIA_ADMIN_TOKEN", "admin123")


def import_data(
    data_path: str,
    api_url: str,
    token: str,
    dry_run: bool = False,
    batch_size: int = 50,
) -> dict[str, Any]:
    """Import scraped offenses into the Sheria Check API.

    Returns summary of the import operation.
    """
    path = Path(data_path)
    if not path.exists():
        return {"error": f"Data file not found: {data_path}"}

    with open(path) as f:
        offenses = json.load(f)

    if not isinstance(offenses, list):
        return {"error": "Data is not a JSON array"}

    total = len(offenses)
    imported = 0
    errors: list[str] = []

    if dry_run:
        print(f"\n── DRY RUN ──")
        print(f"Would import {total} offenses to {api_url}/admin/offenses/bulk")
        print(f"Sample (first offense):")
        if offenses:
            print(json.dumps(offenses[0], indent=2))
        return {"dry_run": True, "total": total, "imported": 0, "errors": []}

    print(f"\nImporting {total} offenses to {api_url}/admin/offenses/bulk ...")

    # Batch the imports
    for i in range(0, total, batch_size):
        batch = offenses[i : i + batch_size]
        try:
            resp = requests.post(
                f"{api_url}/admin/offenses/bulk",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {token}",
                },
                json=batch,
                timeout=30,
            )

            if resp.status_code == 201 or resp.status_code == 200:
                result = resp.json()
                imported += len(batch)
                print(f"  ✓ Batch {i//batch_size + 1}: {len(batch)} offenses imported")
            elif resp.status_code == 401:
                return {"error": "Authentication failed. Check SHERIA_ADMIN_TOKEN."}
            else:
                err_msg = f"  ✗ Batch {i//batch_size + 1}: HTTP {resp.status_code}"
                try:
                    detail = resp.json().get("error", resp.text[:200])
                    err_msg += f" — {detail}"
                except Exception:
                    err_msg += f" — {resp.text[:200]}"
                errors.append(err_msg)
                print(err_msg)

        except requests.ConnectionError:
            return {"error": f"Cannot connect to {api_url}. Is the server running?"}
        except requests.RequestException as e:
            errors.append(f"  ✗ Batch {i//batch_size + 1}: {e}")
            print(f"  ✗ Batch {i//batch_size + 1}: {e}")

    summary = {
        "total": total,
        "imported": imported,
        "errors": errors,
        "success": len(errors) == 0,
    }

    print(f"\n── Import Summary ──")
    print(f"  Total:   {total}")
    print(f"  Success: {imported}")
    print(f"  Errors:  {len(errors)}")

    if errors:
        for err in errors[:5]:
            print(f"  • {err}")
        if len(errors) > 5:
            print(f"  ... and {len(errors) - 5} more")

    return summary


def main():
    parser = argparse.ArgumentParser(description="Import scraped offenses into Sheria Check API")
    parser.add_argument("--data", default=str(DEFAULT_DATA), help=f"Path to JSON data (default: {DEFAULT_DATA})")
    parser.add_argument("--api", default=DEFAULT_API, help=f"API base URL (default: {DEFAULT_API})")
    parser.add_argument("--token", default=DEFAULT_TOKEN, help="Admin token")
    parser.add_argument("--dry-run", action="store_true", help="Validate without importing")
    parser.add_argument("--batch-size", type=int, default=50, help="Batch size for import (default: 50)")
    args = parser.parse_args()

    result = import_data(
        data_path=args.data,
        api_url=args.api,
        token=args.token,
        dry_run=args.dry_run,
        batch_size=args.batch_size,
    )

    if "error" in result:
        print(f"\nError: {result['error']}")
        sys.exit(1)


if __name__ == "__main__":
    main()
