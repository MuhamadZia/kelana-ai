"use client";

import { useState } from "react";
import type { Conversation } from "@/types/chat";
import {
  createConversation,
  deleteConversation,
  updateConversationTitle,
} from "@/services/chatService";

interface ConversationListProps {
  conversations:   Conversation[];
  activeId:        number | null;
  onSelect:        (id: number) => void;
  onCreated:       (conv: Conversation) => void;
  onDeleted:       (id: number) => void;
  onTitleUpdated:  (conv: Conversation) => void;
}

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  onCreated,
  onDeleted,
  onTitleUpdated,
}: ConversationListProps) {
  const [newTitle, setNewTitle]     = useState("");
  const [creating, setCreating]     = useState(false);
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [editTitle, setEditTitle]   = useState("");
  const [error, setError]           = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const conv = await createConversation(newTitle.trim());
      setNewTitle("");
      onCreated(conv);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create.");
    } finally {
      setCreating(false);
    }
  }

  async function handleRename(conv: Conversation) {
    if (!editTitle.trim() || editTitle.trim() === conv.title) {
      setEditingId(null);
      return;
    }
    try {
      const updated = await updateConversationTitle(conv.id, editTitle.trim());
      onTitleUpdated(updated);
    } catch { /* silent */ }
    setEditingId(null);
  }

  async function handleDelete(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    try {
      await deleteConversation(id);
      onDeleted(id);
    } catch { /* silent */ }
  }

  function startEdit(e: React.MouseEvent, conv: Conversation) {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  }

  return (
    <aside className="flex flex-col h-full">
      {/* New conversation form */}
      <form onSubmit={handleCreate} className="p-4 border-b border-maroon/10">
        <p className="text-xs font-semibold text-maroon/50 uppercase tracking-wider mb-2">
          New Conversation
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Conversation title…"
            className="flex-1 min-w-0 rounded-xl border border-maroon/20 bg-cream px-3 py-2 text-sm text-maroon placeholder-maroon/30 focus:outline-none focus:ring-2 focus:ring-orange/50"
          />
          <button
            type="submit"
            disabled={creating || !newTitle.trim()}
            className="shrink-0 bg-orange text-white text-sm font-semibold px-3 py-2 rounded-xl hover:bg-orange/90 disabled:opacity-50 transition-all"
          >
            {creating ? "…" : "+"}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </form>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 && (
          <p className="text-xs text-maroon/30 text-center py-8">No conversations yet.</p>
        )}
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
              activeId === conv.id
                ? "bg-orange/10 border border-orange/20"
                : "hover:bg-maroon/5 border border-transparent"
            }`}
          >
            {editingId === conv.id ? (
              <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => handleRename(conv)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename(conv);
                  if (e.key === "Escape") setEditingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 min-w-0 rounded-lg border border-orange/40 bg-cream px-2 py-0.5 text-sm text-maroon focus:outline-none"
              />
            ) : (
              <p className="flex-1 min-w-0 text-sm text-maroon truncate">{conv.title}</p>
            )}

            {/* Action buttons — visible on hover or when active */}
            <div className="shrink-0 hidden group-hover:flex items-center gap-1">
              <button
                onClick={(e) => startEdit(e, conv)}
                className="p-1 rounded-lg text-maroon/40 hover:text-orange hover:bg-orange/10 transition-all"
                title="Rename"
              >
                ✏️
              </button>
              <button
                onClick={(e) => handleDelete(e, conv.id)}
                className="p-1 rounded-lg text-maroon/40 hover:text-red-500 hover:bg-red-50 transition-all"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
