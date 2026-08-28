"use client";

import { useState, useEffect, useCallback } from "react";
import { getTrips } from "@/services/tripService";
import type { Trip, PaginatedTripsResponse } from "@/types/trip";
import TripCard from "./TripCard";

const LIMIT = 9;

export default function TripHistory() {
  const [data, setData]               = useState<PaginatedTripsResponse | null>(null);
  const [search, setSearch]           = useState("");
  const [inputValue, setInputValue]   = useState("");
  const [page, setPage]               = useState(1);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTrips({ destination: search || undefined, page, limit: LIMIT });
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load trips.");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(inputValue);
  }

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  return (
    <div>
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-md">
        <input
          type="text"
          placeholder="Search by destination…"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 rounded-xl border border-maroon/20 bg-white/60 px-4 py-2.5 text-sm text-maroon placeholder-maroon/30 focus:outline-none focus:ring-2 focus:ring-orange/50"
        />
        <button
          type="submit"
          className="bg-orange text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-orange/90 transition-all"
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setInputValue(""); setSearch(""); setPage(1); }}
            className="px-4 py-2.5 rounded-xl text-sm border border-maroon/20 text-maroon/60 hover:text-orange hover:border-orange transition-all"
          >
            Clear
          </button>
        )}
      </form>

      {/* States */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-maroon/5 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      {!loading && !error && data && (
        <>
          {/* Total trips counter */}
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/60 backdrop-blur-sm border border-maroon/10 rounded-2xl px-6 py-4 shadow-sm flex items-center gap-3">
              <span className="text-3xl font-serif font-bold text-maroon">{data.total}</span>
              <div>
                <p className="text-xs text-maroon/40 uppercase tracking-wider">Total Trips</p>
                <p className="text-xs text-maroon/60">all time</p>
              </div>
            </div>
            {search && (
              <p className="text-sm text-maroon/50">
                Showing results for &ldquo;<span className="text-maroon font-medium">{search}</span>&rdquo;
              </p>
            )}
          </div>

          {data.items.length === 0 ? (
            <div className="text-center py-20 text-maroon/40">
              <p className="text-4xl mb-3">🗺️</p>
              <p className="text-sm">No trips found. Start planning your first trip!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.items.map((trip: Trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl text-sm border border-maroon/20 text-maroon/60 hover:border-orange hover:text-orange transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                    p === page
                      ? "bg-orange text-white"
                      : "border border-maroon/20 text-maroon/60 hover:border-orange hover:text-orange"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl text-sm border border-maroon/20 text-maroon/60 hover:border-orange hover:text-orange transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
