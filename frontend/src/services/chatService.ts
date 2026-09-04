import { authHeaders } from "@/services/authService";
import type { Conversation, Message, SendMessagePayload } from "@/types/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const BASE    = `${API_URL}/api/v1/conversations`;

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Request failed (${res.status})`);
  }
  return res.json();
}

/** Create a new conversation with a title. */
export async function createConversation(title: string): Promise<Conversation> {
  return handle(await fetch(BASE, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ title }),
  }));
}

/** List all conversations for the current user (summaries, no messages). */
export async function listConversations(): Promise<Conversation[]> {
  return handle(await fetch(BASE, { headers: authHeaders() }));
}

/** Get a single conversation with its full message history. */
export async function getConversation(id: number): Promise<Conversation> {
  return handle(await fetch(`${BASE}/${id}`, { headers: authHeaders() }));
}

/** Update conversation title. */
export async function updateConversationTitle(id: number, title: string): Promise<Conversation> {
  return handle(await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ title }),
  }));
}

/** Soft-delete a conversation. */
export async function deleteConversation(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Failed to delete conversation.");
  }
}

/** Send a user message and get the assistant reply back. */
export async function sendMessage(
  conversationId: number,
  payload: SendMessagePayload,
): Promise<Message> {
  return handle(await fetch(`${BASE}/${conversationId}/messages`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }));
}
