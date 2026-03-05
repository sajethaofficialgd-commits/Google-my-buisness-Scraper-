"use client";

import { useState } from "react";
import Link from "next/link";

const GOOGLE_DOC_URL =
  "https://docs.google.com/document/d/1Boevc0z9moifdURA9OwsdECQdDoRdu_R4q1LrM-Aj9k/edit";

type Status = "idle" | "running" | "done" | "error";

export default function Scraper() {
  const [query, setQuery] = useState("digital marketing agency");
  const [location, setLocation] = useState("Krishnagiri");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleScrape() {
    if (!query.trim() || !location.trim() || status === "running") return;
    setStatus("running");
    setErrorMsg("");

    try {
      const res = await fetch("/api/run-scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), location: location.trim() }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error ?? "Unknown error");
        setStatus("error");
      } else {
        setStatus("done");
      }
    } catch {
      setErrorMsg("Network error — could not reach the server.");
      setStatus("error");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-sm font-bold hover:bg-green-500 transition-colors"
          >
            ←
          </Link>
          <div>
            <h1 className="text-sm font-semibold">GMB Review Scraper</h1>
            <p className="text-xs text-gray-500">Powered by SerpAPI + n8n</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600/20 text-3xl">
              🗺️
            </div>
            <h2 className="text-2xl font-bold">Scrape Google Maps Reviews</h2>
            <p className="mt-2 text-sm text-gray-400">
              Finds the top 20 businesses, fetches their reviews, filters detailed ones (&gt;4
              sentences), and writes everything to your Google Doc.
            </p>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                What to search
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="digital marketing agency"
                disabled={status === "running"}
                className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-green-500/60 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Krishnagiri"
                disabled={status === "running"}
                className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-green-500/60 focus:outline-none disabled:opacity-50"
              />
            </div>

            <button
              onClick={handleScrape}
              disabled={status === "running" || !query.trim() || !location.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "running" ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Scraping reviews… (this takes 1–2 minutes)
                </>
              ) : (
                "Scrape Reviews"
              )}
            </button>
          </div>

          {/* Result */}
          {status === "done" && (
            <div className="mt-4 rounded-2xl border border-green-500/30 bg-green-500/10 p-5">
              <div className="flex items-center gap-2 text-green-400 font-semibold">
                <span className="text-lg">✓</span>
                Reviews scraped and written to Google Doc
              </div>
              <p className="mt-1 text-sm text-gray-400">
                The document has been updated with reviews for &quot;{query} in {location}&quot;.
              </p>
              <a
                href={GOOGLE_DOC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 transition-colors"
              >
                Open Google Doc →
              </a>
              <button
                onClick={() => setStatus("idle")}
                className="ml-3 text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Run again
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
              <div className="flex items-center gap-2 text-red-400 font-semibold">
                <span className="text-lg">✕</span>
                Scraping failed
              </div>
              <p className="mt-1 text-sm text-gray-400">{errorMsg}</p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-3 text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Info */}
          {status === "idle" && (
            <p className="mt-4 text-center text-xs text-gray-600">
              Results are written to your connected Google Doc · Workflow runs on your n8n instance
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
