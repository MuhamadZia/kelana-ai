"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import { listConversations } from "@/services/chatService";
import type { Conversation } from "@/types/chat";

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId]           = useState<number | null>(null);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    listConversations()
      .then((list) => {
        setConversations(list);
        if (list.length > 0) setActiveId(list[0].id);
      })
      .catch(() => { /* silent — user will see empty state */ })
      .finally(() => setLoading(false));
  }, []);

  function handleCreated(conv: Conversation) {
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
  }

  function handleDeleted(id: number) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveId((prev) => {
      if (prev !== id) return prev;
      const remaining = conversations.filter((c) => c.id !== id);
      return remaining.length > 0 ? remaining[0].id : null;
    });
  }

  function handleTitleUpdated(updated: Conversation) {
    setConversations((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, title: updated.title } : c)),
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 shrink-0 border-r border-maroon/10 bg-white/40 backdrop-blur-sm flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <h1 className="font-serif text-xl font-bold text-maroon">AI Chat</h1>
            <p className="text-xs text-maroon/40 mt-0.5">Your travel assistant</p>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-xl bg-maroon/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              activeId={activeId}
              onSelect={setActiveId}
              onCreated={handleCreated}
              onDeleted={handleDeleted}
              onTitleUpdated={handleTitleUpdated}
            />
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-hidden flex flex-col bg-cream">
          {activeId ? (
            <ChatWindow key={activeId} conversationId={activeId} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-maroon/30">
              <p className="text-5xl mb-4">💬</p>
              <p className="text-sm font-medium">Select or create a conversation to start.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
