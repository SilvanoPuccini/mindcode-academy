// Shared duration formatter for class/course durations.
//
// Durations arrive from the API in MINUTES (lessons.duration in the backend
// seed holds values like 9..12), so render them directly instead of dividing
// by 3600. Examples: 12 -> "12 min", 80 -> "1 h 20 min", 60 -> "1 h".
export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  if (hours <= 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}
