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
    description: "No license, expired license, no insurance, and document-related offenses",
    icon: "file-text",
    count: 0,
  },
  {
    id: "vehicle-condition",
    name: "Vehicle Condition",
    description: "Bald tires, broken lights, no reflectors, expired inspection",
    icon: "wrench",
    count: 0,
  },
  {
    id: "traffic-rules",
    name: "Traffic Rules",
    description: "Overtaking on yellow line, ignoring traffic lights, wrong lane",
    icon: "traffic-cone",
    count: 0,
  },
  {
    id: "parking-loading",
    name: "Parking & Loading",
    description: "Illegal parking, overloading goods or passengers",
    icon: "truck",
    count: 0,
  },
  {
    id: "alcohol-drugs",
    name: "Alcohol & Drugs",
    description: "Driving under the influence of alcohol or drugs",
    icon: "beer",
    count: 0,
  },
];
