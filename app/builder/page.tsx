"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChatInput } from "@/components/ChatInput";
import { WorkflowResult, WorkflowResultData } from "@/components/WorkflowResult";
import { StatusBadge } from "@/components/StatusBadge";

const EXAMPLES = [
  "Every Monday at 9am, fetch top HN stories and send a Slack summary",
  "Webhook that receives a contact form, filters spam, and saves to Google Sheets",
  "Every hour, check a URL for changes and email me if something changed",
  "Search Google Maps for coffee shops in Chennai and save results to Airtable",
];

export default function Builder() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<WorkflowResultData[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [results, loading]);

  async function handleSubmit() {
    if (!prompt.trim() || loading) return;

    const userPrompt = prompt.trim();
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/build-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setResults((prev) => [
          ...prev,
          { prompt: userPrompt, status: "error", error: data.error ?? "Unknown error" },
        ]);
      } else {
        setResults((prev) => [
          ...prev,
          {
            prompt: userPrompt,
            status: "success",
            workflowName: data.workflowName,
            workflowUrl: data.workflowUrl,
            workflowId: data.workflowId,
            json: data.json,
          },
        ]);
      }
    } catch {
      setResults((prev) => [
        ...prev,
        { prompt: userPrompt, status: "error", error: "Network error — is the server running?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-gray-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold hover:bg-indigo-500 transition-colors">
            n8
          </Link>
          <div>
            <h1 className="text-sm font-semibold">n8n Workflow Builder</h1>
            <p className="text-xs text-gray-500">Powered by GPT-4o</p>
          </div>
        </div>
        {loading && <StatusBadge status="loading" />}
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          {results.length === 0 && !loading && (
            <div className="flex flex-col items-center gap-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 text-3xl">
                ⚡
              </div>
              <div>
                <h2 className="text-xl font-semibold">Build n8n Workflows with AI</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Describe what you want in plain English — GPT-4o generates and deploys the workflow instantly.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Try an example</p>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setPrompt(ex)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-gray-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-white transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.map((result, i) => (
            <WorkflowResult key={i} data={result} />
          ))}

          {loading && (
            <div className="flex items-center gap-3 self-start rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
              Generating and deploying your workflow…
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="border-t border-white/10 px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <ChatInput
            value={prompt}
            onChange={setPrompt}
            onSubmit={handleSubmit}
            loading={loading}
          />
          <p className="mt-2 text-center text-xs text-gray-600">
            Workflows are created in your n8n instance as inactive — activate them manually after review.
          </p>
        </div>
      </footer>
    </div>
  );
}
