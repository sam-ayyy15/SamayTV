export function scoreColor(voteAverage: number): string {
  if (voteAverage >= 7) return "var(--score-high)";
  if (voteAverage >= 4) return "var(--score-mid)";
  return "var(--score-low)";
}

export function scorePercent(voteAverage: number): number {
  return Math.max(0, Math.min(100, (voteAverage / 10) * 100));
}
