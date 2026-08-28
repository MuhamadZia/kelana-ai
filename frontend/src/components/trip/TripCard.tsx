import type { Trip } from "@/types/trip";
import Link from "next/link";
import { TRAVEL_STYLE_COLORS, type TravelStyle } from "@/constants/travelStyles";
import { getCategoryColor } from "@/constants/tripCategories";

interface TripCardProps {
  trip: Trip;
}

export default function TripCard({ trip }: TripCardProps) {
  const categoryColor    = getCategoryColor(trip.category);
  const travelStyleColor = trip.travel_style
    ? (TRAVEL_STYLE_COLORS[trip.travel_style as TravelStyle] ?? "bg-maroon/10 text-maroon")
    : null;

  return (
    <Link href={`/trips/${trip.id}`}>
      <div className="group bg-white/60 backdrop-blur-sm border border-maroon/10 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-orange/30 transition-all cursor-pointer h-full flex flex-col">
        {/* Destination + category badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="font-serif text-lg font-bold text-maroon group-hover:text-orange transition-colors leading-tight">
            {trip.destination}
          </h3>
          <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${categoryColor}`}>
            {trip.category}
          </span>
        </div>

        {/* Trip stats */}
        <div className="grid grid-cols-2 gap-3 flex-1">
          <Stat label="Duration"     value={`${trip.days} day${trip.days > 1 ? "s" : ""}`} />
          <Stat label="Budget"       value={`$${trip.budget.toLocaleString()}`} />
          <Stat label="Daily Budget" value={`$${trip.daily_budget.toLocaleString()}`} />
          <div>
            <p className="text-xs text-maroon/40 uppercase tracking-wider mb-0.5">Travel Style</p>
            {travelStyleColor ? (
              <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${travelStyleColor}`}>
                {trip.travel_style}
              </span>
            ) : (
              <p className="text-sm font-medium text-maroon/40">—</p>
            )}
          </div>
        </div>

        {/* AI badge */}
        <div className="mt-4 pt-4 border-t border-maroon/5 flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              trip.ai_recommendation ? "bg-green-400" : "bg-maroon/20"
            }`}
          />
          <span className="text-xs text-maroon/50">
            {trip.ai_recommendation ? "Itinerary ready" : "No itinerary yet"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-maroon/40 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-medium text-maroon">{value}</p>
    </div>
  );
}
