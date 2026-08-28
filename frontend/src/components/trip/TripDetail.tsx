"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getTripById } from "@/services/tripService";
import type { Trip } from "@/types/trip";
import { TRAVEL_STYLE_COLORS, type TravelStyle } from "@/constants/travelStyles";
import { getCategoryColor } from "@/constants/tripCategories";

interface TripDetailProps {
  tripId: number;
}

export default function TripDetail({ tripId }: TripDetailProps) {
  const router = useRouter();
  const [trip, setTrip]       = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    getTripById(tripId)
      .then(setTrip)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load trip."))
      .finally(() => setLoading(false));
  }, [tripId]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="h-40 rounded-2xl bg-maroon/5 animate-pulse" />
        <div className="h-96 rounded-2xl bg-maroon/5 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 max-w-2xl mx-auto">{error}</p>
    );
  }

  if (!trip) return null;

  const categoryColor    = getCategoryColor(trip.category);
  const travelStyleColor = trip.travel_style
    ? (TRAVEL_STYLE_COLORS[trip.travel_style as TravelStyle] ?? "bg-maroon/10 text-maroon")
    : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="text-sm border border-maroon/20 text-maroon/60 px-4 py-1.5 rounded-full hover:border-orange hover:text-orange transition-all"
      >
        ← Back to history
      </button>

      {/* Trip info card */}
      <div className="bg-white/60 backdrop-blur-sm border border-maroon/10 rounded-2xl p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="font-serif text-3xl font-bold text-maroon">{trip.destination}</h2>
            <p className="text-xs text-maroon/40 mt-1">Trip #{trip.id}</p>
          </div>
          {/* Category badge */}
          <span className={`shrink-0 text-sm font-semibold px-4 py-1.5 rounded-full ${categoryColor}`}>
            {trip.category}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InfoBlock label="Duration"     value={`${trip.days} day${trip.days > 1 ? "s" : ""}`} />
          <InfoBlock label="Total Budget" value={`$${trip.budget.toLocaleString()}`} />
          <InfoBlock label="Daily Budget" value={`$${trip.daily_budget.toLocaleString()}`} />
          {/* Travel style badge inside info block */}
          <div className="bg-cream rounded-xl px-4 py-3">
            <p className="text-xs text-maroon/40 uppercase tracking-wider mb-1">Travel Style</p>
            {travelStyleColor ? (
              <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${travelStyleColor}`}>
                {trip.travel_style}
              </span>
            ) : (
              <p className="text-sm font-semibold text-maroon/40">—</p>
            )}
          </div>
        </div>
      </div>

      {/* AI Itinerary card */}
      {trip.ai_recommendation ? (
        <div className="bg-white/60 backdrop-blur-sm border border-maroon/10 rounded-2xl p-8 shadow-sm">
          <h3 className="font-serif text-xl font-bold text-maroon mb-6">AI Itinerary</h3>
          <div className="markdown-body text-maroon text-sm leading-relaxed">
            <ReactMarkdown>{trip.ai_recommendation}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-sm border border-maroon/10 rounded-2xl p-8 shadow-sm text-center">
          <p className="text-maroon/40 text-sm">No itinerary has been generated for this trip yet.</p>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cream rounded-xl px-4 py-3">
      <p className="text-xs text-maroon/40 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-semibold text-maroon">{value}</p>
    </div>
  );
}
