// Must match backend get_trip_category() thresholds
export const TRIP_CATEGORY_COLORS: Record<string, string> = {
  Backpacker: "bg-teal-100   text-teal-700",
  Standard:   "bg-blue-100   text-blue-700",
  Luxury:     "bg-yellow-100 text-yellow-700",
};

export function getCategoryColor(category: string): string {
  return TRIP_CATEGORY_COLORS[category] ?? "bg-maroon/10 text-maroon";
}
