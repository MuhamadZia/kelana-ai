"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { askQuestion } from "@/services/askService";
import type { AskResponse } from "@/types/ask";

export default function QnaForm() {
  const [question, setQuestion] = useState("");
  const [history, setHistory]   = useState<AskResponse[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const result = await askQuestion({ question: question.trim() });
      setHistory((prev) => [result, ...prev]);
      setQuestion("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/60 backdrop-blur-sm border border-maroon/10 rounded-2xl p-6 shadow-sm"
      >
        <label className="block text-xs font-semibold text-maroon/70 uppercase tracking-wider mb-2">
          Your Question
        </label>
        <textarea
          required
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
          }}
          placeholder="Ask anything about travel destinations, tips, visa requirements…"
          className="w-full rounded-xl border border-maroon/20 bg-cream px-4 py-3 text-sm text-maroon placeholder-maroon/30 focus:outline-none focus:ring-2 focus:ring-orange/50 resize-none"
        />
        <p className="text-xs text-maroon/30 mt-1 mb-4">Press Enter to send, Shift+Enter for new line.</p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2 mb-4">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="w-full bg-orange text-white font-semibold rounded-xl py-3 text-sm hover:bg-orange/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Searching knowledge base…" : "Ask"}
        </button>
      </form>

      {/* Loading skeleton */}
      {loading && (
        <div className="bg-white/60 border border-maroon/10 rounded-2xl p-6 space-y-3 animate-pulse">
          <div className="h-4 bg-maroon/10 rounded w-3/4" />
          <div className="h-4 bg-maroon/10 rounded w-full" />
          <div className="h-4 bg-maroon/10 rounded w-5/6" />
        </div>
      )}

      {/* Answer history */}
      {history.length > 0 && (
        <div className="space-y-5">
          {history.map((item, idx) => (
            <div
              key={idx}
              className="bg-white/60 backdrop-blur-sm border border-maroon/10 rounded-2xl p-6 shadow-sm"
            >
              {/* Question bubble */}
              <div className="flex items-start gap-3 mb-4">
                <span className="shrink-0 w-7 h-7 rounded-full bg-orange/20 flex items-center justify-center text-xs font-bold text-orange">
                  Q
                </span>
                <p className="text-sm font-semibold text-maroon leading-relaxed pt-0.5">
                  {item.question}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-maroon/5 mb-4" />

              {/* Answer */}
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-maroon/10 flex items-center justify-center text-xs font-bold text-maroon">
                  A
                </span>
                <div className="markdown-body text-maroon text-sm leading-relaxed flex-1">
                  <ReactMarkdown>{item.answer}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && history.length === 0 && (
        <div className="text-center py-16 text-maroon/30">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-sm">Ask a question to get started.</p>
        </div>
      )}
    </div>
  );
}
