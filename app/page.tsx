"use client";

import { useState } from "react";
import Link from "next/link";

type Status = "idle" | "running" | "done" | "error";

interface Review {
  reviewer_name: string;
  review_rating: number | null;
  review_date: string;
  review_text: string;
  sentence_count: number;
}

interface PlaceResult {
  place_name: string;
  place_rating: number | null;
  place_address: string;
  reviews: Review[];
}

interface ScrapeResult {
  query: string;
  location: string;
  places_found: number;
  places_with_reviews: number;
  total_reviews: number;
  results: PlaceResult[];
}

export default function Home() {
  const [query, setQuery] = useState("digital marketing agency");
  const [location, setLocation] = useState("Krishnagiri");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setData] = useState<ScrapeResult | null>(null);

  async function handleScrape() {
    if (!query.trim() || !location.trim() || status === "running") return;
    setStatus("running");
    setErrorMsg("");
    setData(null);

    try {
      const res = await fetch("/api/run-scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), location: location.trim() }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setErrorMsg(json.error ?? "Unknown error");
        setStatus("error");
      } else {
        setData(json);
        setStatus("done");
      }
    } catch {
      setErrorMsg("Network error — could not reach the server.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-lg">
              🗺️
            </div>
            <div>
              <h1 className="text-sm font-semibold">GMB Review Scraper</h1>
              <p className="text-xs text-gray-500">Powered by SerpAPI</p>
            </div>
          </div>
          <Link
            href="/builder"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            AI Workflow Builder →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Search Form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-lg font-semibold">Search Google Maps Reviews</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScrape()}
              placeholder="digital marketing agency"
              disabled={status === "running"}
              className="flex-1 rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-green-500/60 focus:outline-none disabled:opacity-50"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScrape()}
              placeholder="Krishnagiri"
              disabled={status === "running"}
              className="w-full sm:w-44 rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-green-500/60 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleScrape}
              disabled={status === "running" || !query.trim() || !location.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "running" ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Scraping…
                </>
              ) : (
                "Scrape Reviews"
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            Searches top 5 businesses · filters reviews with &gt;4 sentences
          </p>
        </div>

        {/* Error */}
        {status === "error" && (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm font-medium text-red-400">✕ {errorMsg}</p>
            <button onClick={() => setStatus("idle")} className="mt-2 text-xs text-gray-500 hover:text-gray-300">
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {status === "done" && data && (
          <div className="mt-6 flex flex-col gap-6">
            {/* Summary */}
            <div className="flex items-center gap-4 rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
              <span className="text-xl">✓</span>
              <div>
                <p className="font-semibold text-green-400">
                  Found {data.total_reviews} qualifying reviews across {data.places_with_reviews} businesses
                </p>
                <p className="text-xs text-gray-400">
                  Searched &quot;{data.query} in {data.location}&quot; · {data.places_found} places scanned
                </p>
              </div>
              <button
                onClick={() => { setStatus("idle"); setData(null); }}
                className="ml-auto text-xs text-gray-500 hover:text-gray-300"
              >
                New search
              </button>
            </div>

            {/* Places */}
            {data.results.map((place, pi) => (
              <div key={pi} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                {/* Place header */}
                <div className="border-b border-white/10 bg-white/5 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">{place.place_name}</h3>
                      {place.place_address && (
                        <p className="mt-0.5 text-xs text-gray-500">{place.place_address}</p>
                      )}
                    </div>
                    {place.place_rating && (
                      <span className="shrink-0 rounded-lg bg-yellow-500/20 px-2 py-1 text-xs font-semibold text-yellow-400">
                        ★ {place.place_rating}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{place.reviews.length} qualifying review{place.reviews.length !== 1 ? "s" : ""}</p>
                </div>

                {/* Reviews */}
                <div className="divide-y divide-white/5">
                  {place.reviews.map((review, ri) => (
                    <div key={ri} className="px-5 py-4">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-200">{review.reviewer_name}</span>
                        {review.review_rating && (
                          <span className="text-xs text-yellow-400">{"★".repeat(review.review_rating)}</span>
                        )}
                        {review.review_date && (
                          <span className="text-xs text-gray-600">{review.review_date}</span>
                        )}
                        <span className="ml-auto text-xs text-gray-600">{review.sentence_count} sentences</span>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-300">{review.review_text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
