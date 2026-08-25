"use client";

import { useState } from "react";
import Image from "next/image";
import Navbar from "./components/Navbar";
import TripForm from "./components/TripForm";
import RecommendationResult from "./components/RecommendationResult";

export default function Home() {
  const [result, setResult] = useState<{ tripId: number; recommendation: string } | null>(null);

  function handleResult(tripId: number, recommendation: string) {
    setResult({ tripId, recommendation });
  }

  function handleReset() {
    setResult(null);
  }

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative w-full h-[520px] md:h-[600px] flex items-center justify-center text-center overflow-hidden">
        {/* Background image */}
        <Image
          src="/hero-img.webp"
          alt="Travel destination hero"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-maroon/40" />

        {/* Text content */}
        <div className="relative z-10 px-6">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-cream leading-tight max-w-2xl mx-auto drop-shadow-md">
            Travel smarter &{" "}
            <span className="text-orange italic">explore</span> the world
          </h1>
          <p className="mt-5 text-cream/80 text-base max-w-xl mx-auto leading-relaxed drop-shadow-sm">
            KelanaAI builds a personalised day-by-day itinerary for any destination —
            tailored to your budget and travel style, powered by AI.
          </p>
          <a
            href="#plan"
            className="inline-block mt-8 bg-orange text-white font-semibold px-8 py-3 rounded-full text-sm hover:bg-orange/90 transition-all shadow-md"
          >
            Start Planning
          </a>
        </div>
      </section>

      {/* Main content */}
      <main id="plan" className="flex-1 px-6 py-14">
        <div className="max-w-6xl mx-auto">
          {result ? (
            <RecommendationResult
              tripId={result.tripId}
              recommendation={result.recommendation}
              onReset={handleReset}
            />
          ) : (
            <TripForm onResult={handleResult} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-maroon/10 py-6 text-center">
        <p className="text-xs text-maroon/40">© {new Date().getFullYear()} KelanaAI. All rights reserved.</p>
      </footer>
    </>
  );
}
