import type { OffenseCategory } from "../types";

export const DEFAULT_CATEGORIES: OffenseCategory[] = [
  {
    id: "speeding-reckless",
    name: "Speeding & Reckless Driving",
    description: "Speeding, dangerous driving, racing, and careless driving offenses",
    icon: "gauge",
    count: 0,
  },
  {
    id: "license-documents",
    name: "License & Documents",
    description: "Driving without a license, expired documents, missing insurance",
    icon: "file-text",
    count: 0,
  },
  {
    id: "alcohol-drugs",
    name: "Alcohol & Drugs",
    description: "Driving under the influence, drug-related driving offenses",
    icon: "wine",
    count: 0,
  },
  {
    id: "vehicle-conditions",
    name: "Vehicle Condition",
    description: "Defective vehicles, unroadworthy conditions, missing mirrors/lights",
    icon: "car",
    count: 0,
  },
  {
    id: "parking-stopping",
    name: "Parking & Stopping",
    description: "Illegal parking, unauthorized stopping, obstruction offenses",
    icon: "square-parking",
    count: 0,
  },
  {
    id: "public-transport",
    name: "Public Service Vehicles",
    description: "PSV licensing, matatu rules, conductor/driver authorization",
    icon: "bus",
    count: 0,
  },
  {
    id: "road-markings-signs",
    name: "Road Markings & Signs",
    description: "Disobeying traffic signals, lane violations, unauthorized U-turns",
    icon: "sign",
    count: 0,
  },
  {
    id: "other",
    name: "Other Offenses",
    description: "Miscellaneous traffic offenses and regulatory violations",
    icon: "list",
    count: 0,
  },
];
