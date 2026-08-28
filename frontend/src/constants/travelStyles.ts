export const TRAVEL_STYLES = [
  "Adventure",
  "Cultural",
  "Relaxed",
  "Luxury",
  "Budget",
  "Family",
  "Solo",
  "Couple",
] as const;

export type TravelStyle = (typeof TRAVEL_STYLES)[number];

// Badge color per travel style
export const TRAVEL_STYLE_COLORS: Record<TravelStyle, string> = {
  Adventure: "bg-amber-100  text-amber-700",
  Cultural:  "bg-purple-100 text-purple-700",
  Relaxed:   "bg-sky-100    text-sky-700",
  Luxury:    "bg-yellow-100 text-yellow-700",
  Budget:    "bg-green-100  text-green-700",
  Family:    "bg-pink-100   text-pink-700",
  Solo:      "bg-indigo-100 text-indigo-700",
  Couple:    "bg-rose-100   text-rose-700",
};
