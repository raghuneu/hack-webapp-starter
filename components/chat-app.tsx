"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useMemo, useRef, useState } from "react";

type Mode = "chat" | "agent";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const TOOL_LABELS: Record<string, string> = {
  lookupOrder: "Order Lookup",
  lookupCustomer: "Customer Lookup",
  searchTickets: "Ticket Search",
  getTicketDetails: "Ticket Details",
  getBillingHistory: "Billing History",
  triageTicket: "Triage",
  draftResponse: "Draft Response",
  getOpsMetrics: "Ops Metrics",
  calculate: "Calculate",
};

function MessagePart({
  part,
  messageId,
  index,
}: {
  part: UIMessage["parts"][number];
  messageId: string;
  index: number;
}) {
  if (part.type === "text") {
    return (
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{part.text}</p>
    );
  }

  if (part.type === "file" && part.mediaType?.startsWith("image/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={part.url}
        alt={part.filename ?? "Uploaded image"}
        className="mt-2 max-h-48 rounded-lg border border-zinc-800 object-contain"
      />
    );
  }

  if (part.type.startsWith("tool-")) {
    const rawName = part.type.replace("tool-", "");
    const label = TOOL_LABELS[rawName] ?? rawName;
    const state = "state" in part ? part.state : "unknown";

    const stateIcon =
      state === "input-available"
        ? "▶"
        : state === "output-available"
          ? "✓"
          : state === "output-error"
            ? "✗"
            : "…";
    const stateColor =
      state === "output-available"
        ? "text-emerald-400"
        : state === "output-error"
          ? "text-red-400"
          : "text-[#7C5CFF]";

    return (
      <div
        key={`${messageId}-tool-${index}`}
        className="mt-2 flex items-center gap-2 rounded-lg border border-[#7C5CFF]/30 bg-[rgb(124_92_255/0.08)] px-3 py-2 text-xs"
      >
        <span className={`font-bold ${stateColor}`}>{stateIcon}</span>
        <span className="font-medium text-[#7C5CFF]">{label}</span>
        <span className="text-zinc-500">
          {state === "input-available" && "Running…"}
          {state === "output-available" && "Complete"}
          {state === "output-error" && "Error"}
        </span>
      </div>
    );
  }

  return null;
}

export function ChatApp() {
  const [mode, setMode] = useState<Mode>("chat");
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { mode },
      }),
    [mode],
  );

  const { messages, sendMessage, status, error, stop } = useChat({ transport });

  const isBusy = status === "streaming" || status === "submitted";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text && !imageFile) return;

    const parts: Array<
      | { type: "text"; text: string }
      | { type: "file"; mediaType: string; url: string; filename?: string }
    > = [];

    if (imageFile) {
      parts.push({
        type: "file",
        mediaType: imageFile.type || "image/png",
        url: await fileToDataUrl(imageFile),
        filename: imageFile.name,
      });
    }

    if (text) {
      parts.push({ type: "text", text });
    }

    sendMessage({ parts });
    setInput("");
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex min-h-full flex-col bg-black">
      <header className="border-b border-zinc-800 bg-black">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#7C5CFF]">
              Track 3 — FinOps &amp; Customer Service
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-white">
              Wayfair Ops Agent
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Internal operations assistant for support &amp; finance teams
            </p>
          </div>

          <div className="flex rounded-full border border-zinc-800 bg-zinc-950 p-1">
            <button
              type="button"
              onClick={() => setMode("chat")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                mode === "chat"
                  ? "bg-[#7C5CFF] text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setMode("agent")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                mode === "agent"
                  ? "bg-[#7C5CFF] text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Agent
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6">
        <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
          {mode === "chat" ? (
            <p>
              <span className="font-medium text-[#7C5CFF]">Chat</span> — Quick
              lookups: orders, customers, billing, tickets. Attach screenshots
              for visual context.
            </p>
          ) : (
            <p>
              <span className="font-medium text-[#7C5CFF]">Agent</span> —
              Multi-step ops tasks: triage tickets, investigate billing issues,
              draft responses, review weekly metrics.
            </p>
          )}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          {messages.length === 0 && (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center text-zinc-500">
              <p className="text-lg font-medium text-zinc-200">
                {mode === "chat"
                  ? "What do you need to look up?"
                  : "What should I investigate?"}
              </p>
              <ul className="mt-4 max-w-lg space-y-2 text-sm text-left">
                {(mode === "chat"
                  ? [
                      "Look up order WF-2026-88421",
                      "What's the billing history for Maria Garcia?",
                      "Show me ticket TKT-40198",
                      "Who is customer CUST-1005?",
                    ]
                  : [
                      "Triage all open tickets and recommend priorities",
                      "Investigate why Maria Garcia's refund hasn't been processed and draft a response",
                      "Give me a weekly ops summary with key risks",
                      "Emily Watson cancelled her first order — assess retention risk and draft a win-back message",
                    ]
                ).map((text) => (
                  <li key={text}>
                    <button
                      type="button"
                      className="w-full text-left rounded-lg border border-zinc-800 px-3 py-2 hover:border-[#7C5CFF] hover:bg-[#7C5CFF]/10 transition cursor-pointer"
                      onClick={() => {
                        sendMessage({ parts: [{ type: "text", text }] });
                      }}
                    >
                      &quot;{text}&quot;
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-[#7C5CFF] text-white"
                    : "border border-zinc-800 bg-zinc-900 text-zinc-100"
                }`}
              >
                <div
                  className={`mb-1 text-xs font-medium uppercase tracking-wide ${
                    message.role === "user"
                      ? "text-white/60"
                      : "text-[#7C5CFF]"
                  }`}
                >
                  {message.role === "user" ? "you" : "ops agent"}
                </div>
                {message.parts.map((part, index) => (
                  <MessagePart
                    key={`${message.id}-${index}`}
                    part={part}
                    messageId={message.id}
                    index={index}
                  />
                ))}
              </div>
            </div>
          ))}

          {isBusy && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#7C5CFF]" />
              {mode === "agent" ? "Agent investigating…" : "Looking up…"}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-400">
            {error.message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {imageFile && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span>
                Image:{" "}
                <span className="text-[#7C5CFF]">{imageFile.name}</span>
              </span>
              <button
                type="button"
                className="text-[#7C5CFF] hover:text-[#9B82FF] hover:underline"
                onClick={() => {
                  setImageFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Remove
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setImageFile(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-medium text-zinc-200 hover:border-[#7C5CFF] hover:text-[#7C5CFF]"
              title="Attach screenshot for context"
            >
              Screenshot
            </button>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                mode === "agent"
                  ? "Describe an ops task to investigate…"
                  : "Look up an order, customer, or ticket…"
              }
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/30"
              disabled={isBusy}
            />
            {isBusy ? (
              <button
                type="button"
                onClick={() => stop()}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-[#7C5CFF]"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() && !imageFile}
                className="rounded-xl bg-[#7C5CFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#9B82FF] disabled:opacity-40"
              >
                Send
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
