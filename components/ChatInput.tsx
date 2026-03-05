"use client";

import { useRef, KeyboardEvent } from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function ChatInput({ value, onChange, onSubmit, loading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && value.trim()) onSubmit();
    }
  }

  return (
    <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 focus-within:border-indigo-500/50 transition-colors">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe the workflow you want to build… (Enter to send, Shift+Enter for new line)"
        rows={2}
        className="flex-1 resize-none bg-transparent text-sm text-white placeholder-gray-500 outline-none"
        disabled={loading}
      />
      <button
        onClick={onSubmit}
        disabled={loading || !value.trim()}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition-colors hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Build workflow"
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.908 6.783H14.5a.75.75 0 0 1 0 1.5H4.188l-1.909 6.783a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.208-8.958.75.75 0 0 0 0-1.05A28.897 28.897 0 0 0 3.105 2.288Z" />
          </svg>
        )}
      </button>
    </div>
  );
}
