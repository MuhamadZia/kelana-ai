"use client";

import { useState } from "react";
import { TRAVEL_STYLES, type TravelStyle } from "@/constants/travelStyles";
import { createTrip, generateRecommendation } from "@/services/tripService";

interface TripFormProps {
  onResult: (tripId: number, recommendation: string) => void;
}

export default function TripForm({ onResult }: TripFormProps) {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");
  const [travelStyle, setTravelStyle] = useState<TravelStyle>(TRAVEL_STYLES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Step 1 — create the trip record
      const trip = await createTrip({
        destination,
        days: Number(days),
        budget: Number(budget),
        travel_style: travelStyle,
      });

      // Step 2 — generate AI recommendation
      const generated = await generateRecommendation(trip.id, {
        destination,
        days: Number(days),
        budget: Number(budget),
        travel_style: travelStyle,
      });

      onResult(generated.id, generated.ai_recommendation ?? "");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/60 backdrop-blur-sm border border-maroon/10 rounded-2xl p-8 shadow-sm w-full max-w-2xl mx-auto"
    >
      <h2 className="font-serif text-2xl font-bold text-maroon mb-1">Plan your trip</h2>
      <p className="text-sm text-maroon/60 mb-6">Fill in the details and let AI craft your perfect itinerary.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Destination */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-maroon/70 uppercase tracking-wider mb-1.5">
            Destination
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Bali, Indonesia"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full rounded-xl border border-maroon/20 bg-cream px-4 py-2.5 text-sm text-maroon placeholder-maroon/30 focus:outline-none focus:ring-2 focus:ring-orange/50"
          />
        </div>

        {/* Days */}
        <div>
          <label className="block text-xs font-semibold text-maroon/70 uppercase tracking-wider mb-1.5">
            Number of Days
          </label>
          <input
            type="number"
            required
            min={1}
            placeholder="e.g. 5"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="w-full rounded-xl border border-maroon/20 bg-cream px-4 py-2.5 text-sm text-maroon placeholder-maroon/30 focus:outline-none focus:ring-2 focus:ring-orange/50"
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block text-xs font-semibold text-maroon/70 uppercase tracking-wider mb-1.5">
            Budget (USD)
          </label>
          <input
            type="number"
            required
            min={0}
            placeholder="e.g. 1500"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full rounded-xl border border-maroon/20 bg-cream px-4 py-2.5 text-sm text-maroon placeholder-maroon/30 focus:outline-none focus:ring-2 focus:ring-orange/50"
          />
        </div>

        {/* Travel Style */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-maroon/70 uppercase tracking-wider mb-1.5">
            Travel Style
          </label>
          <div className="flex flex-wrap gap-2">
            {TRAVEL_STYLES.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setTravelStyle(style)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  travelStyle === style
                    ? "bg-orange text-white border-orange"
                    : "border-maroon/20 text-maroon/70 hover:border-orange hover:text-orange"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full bg-orange text-white font-semibold rounded-xl py-3 text-sm tracking-wide hover:bg-orange/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Generating your itinerary…" : "Generate AI Itinerary"}
      </button>
    </form>
  );
}
