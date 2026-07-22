/** Format a number as Kenyan Shillings (e.g. "KES 50,000"). */
export function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

/** Format an ISO date string into a human-readable en-KE locale date. */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
