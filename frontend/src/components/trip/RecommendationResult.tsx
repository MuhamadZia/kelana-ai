"use client";

import ReactMarkdown from "react-markdown";

interface RecommendationResultProps {
  tripId: number;
  recommendation: string;
  onReset: () => void;
}

export default function RecommendationResult({
  tripId,
  recommendation,
  onReset,
}: RecommendationResultProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-maroon">Your Itinerary</h2>
          <p className="text-xs text-maroon/50 mt-0.5">Trip #{tripId}</p>
        </div>
        <button
          onClick={onReset}
          className="text-sm border border-maroon/20 text-maroon/70 px-4 py-1.5 rounded-full hover:border-orange hover:text-orange transition-all"
        >
          ← Plan another trip
        </button>
      </div>

      {/* Markdown card */}
      <div className="bg-white/60 backdrop-blur-sm border border-maroon/10 rounded-2xl p-8 shadow-sm">
        <div className="markdown-body text-maroon text-sm leading-relaxed">
          <ReactMarkdown>{recommendation}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
