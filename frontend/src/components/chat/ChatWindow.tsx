"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { getConversation, sendMessage } from "@/services/chatService";
import type { Conversation, Message } from "@/types/chat";

interface ChatWindowProps {
  conversationId: number;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString())     return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState("");
  const [sending, setSending]           = useState(false);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load conversation + messages
  useEffect(() => {
    setLoading(true);
    setError(null);
    getConversation(conversationId)
      .then((conv) => {
        setConversation(conv);
        setMessages(conv.messages ?? []);
      })
      .catch(() => setError("Failed to load conversation."))
      .finally(() => setLoading(false));
  }, [conversationId]);

  // Auto-scroll to bottom whenever messages change or while sending
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    // Optimistically add user message
    const optimistic: Message = {
      id:              Date.now(),
      conversation_id: conversationId,
      role:            "user",
      content:         text,
      created_at:      new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const assistantMsg = await sendMessage(conversationId, { content: text });
      // Replace optimistic + append real assistant reply
      setMessages((prev) => {
        const withoutOptimistic = prev.filter((m) => m.id !== optimistic.id);
        // Re-add user message with real server data would need a full reload;
        // keeping optimistic user msg is fine visually
        return [...withoutOptimistic, optimistic, assistantMsg];
      });
    } catch (err: unknown) {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }, [input, sending, conversationId]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Group messages by date for date separators
  const grouped: { date: string; messages: Message[] }[] = [];
  messages.forEach((msg) => {
    const date = formatDate(msg.created_at);
    const last = grouped[grouped.length - 1];
    if (last && last.date === date) {
      last.messages.push(msg);
    } else {
      grouped.push({ date, messages: [msg] });
    }
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-3 w-full max-w-lg">
          {[80, 60, 90].map((w, i) => (
            <div key={i} className={`h-10 rounded-2xl bg-maroon/5 animate-pulse w-[${w}%]`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {conversation && (
        <div className="px-6 py-4 border-b border-maroon/10 shrink-0">
          <h2 className="font-serif text-lg font-bold text-maroon truncate">{conversation.title}</h2>
          <p className="text-xs text-maroon/40 mt-0.5">{messages.length} message{messages.length !== 1 ? "s" : ""}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {messages.length === 0 && !sending && (
          <div className="flex flex-col items-center justify-center h-full text-maroon/30">
            <p className="text-4xl mb-3">✈️</p>
            <p className="text-sm">Send a message to start chatting.</p>
          </div>
        )}

        {grouped.map(({ date, messages: group }) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-maroon/10" />
              <span className="text-xs text-maroon/30 shrink-0">{date}</span>
              <div className="flex-1 h-px bg-maroon/10" />
            </div>

            <div className="space-y-4">
              {group.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    msg.role === "user"
                      ? "bg-orange/20 text-orange"
                      : "bg-maroon/10 text-maroon"
                  }`}>
                    {msg.role === "user" ? "Me" : "AI"}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-orange text-white rounded-tr-sm"
                        : "bg-white/70 border border-maroon/10 text-maroon rounded-tl-sm"
                    }`}>
                      {msg.role === "assistant" ? (
                        <div className="markdown-body">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                    {/* Timestamp */}
                    <span className="text-xs text-maroon/30 px-1">{formatTime(msg.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {sending && (
          <div className="flex gap-3 items-end">
            <div className="shrink-0 w-8 h-8 rounded-full bg-maroon/10 flex items-center justify-center text-xs font-bold text-maroon">
              AI
            </div>
            <div className="bg-white/70 border border-maroon/10 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 rounded-full bg-maroon/30 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-maroon/30 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-maroon/30 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2 text-center">{error}</p>
        )}

        {/* Auto-scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-maroon/10 px-6 py-4">
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
            disabled={sending}
            className="flex-1 resize-none rounded-2xl border border-maroon/20 bg-cream px-4 py-3 text-sm text-maroon placeholder-maroon/30 focus:outline-none focus:ring-2 focus:ring-orange/50 max-h-40 overflow-y-auto disabled:opacity-50"
            style={{ height: "auto" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = `${Math.min(t.scrollHeight, 160)}px`;
            }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="shrink-0 bg-orange text-white font-semibold px-5 py-3 rounded-2xl text-sm hover:bg-orange/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "…" : "Send"}
          </button>
        </div>
        <p className="text-xs text-maroon/30 mt-1.5 text-right">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
