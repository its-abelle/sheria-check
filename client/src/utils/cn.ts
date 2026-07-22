import { clsx, type ClassValue } from "clsx";

/** Merge class names using clsx, returning a single concatenated string. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
