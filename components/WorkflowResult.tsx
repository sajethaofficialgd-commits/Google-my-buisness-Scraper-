"use client";

import { useState } from "react";

export interface WorkflowResultData {
  prompt: string;
  status: "success" | "error";
  workflowName?: string;
  workflowUrl?: string;
  workflowId?: string;
  json?: object;
  error?: string;
}

export function WorkflowResult({ data }: { data: WorkflowResultData }) {
  const [jsonOpen, setJsonOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {/* User prompt bubble */}
      <div className="self-end max-w-[80%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-2.5 text-sm text-white">
        {data.prompt}
      </div>

      {/* Result card */}
      <div
        className={`self-start max-w-[90%] rounded-2xl rounded-bl-sm border p-4 text-sm ${
          data.status === "success"
            ? "border-green-500/30 bg-green-500/10"
            : "border-red-500/30 bg-red-500/10"
        }`}
      >
        {data.status === "success" ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span className="font-medium text-green-300">Workflow deployed</span>
            </div>
            <p className="text-gray-300">
              <span className="font-semibold text-white">{data.workflowName}</span>
            </p>
            <div className="flex items-center gap-2">
              <a
                href={data.workflowUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition-colors"
              >
                Open in n8n →
              </a>
              <button
                onClick={() => setJsonOpen(!jsonOpen)}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
              >
                {jsonOpen ? "Hide" : "Show"} JSON
              </button>
            </div>
            {jsonOpen && data.json && (
              <pre className="mt-1 max-h-64 overflow-auto rounded-lg bg-black/40 p-3 text-xs text-gray-300 border border-white/10">
                {JSON.stringify(data.json, null, 2)}
              </pre>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-red-400">✕</span>
              <span className="font-medium text-red-300">Build failed</span>
            </div>
            <p className="text-gray-400 text-xs">{data.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
