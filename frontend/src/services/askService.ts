import { authHeaders } from "@/services/authService";
import type { AskRequest, AskResponse } from "@/types/ask";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function askQuestion(payload: AskRequest): Promise<AskResponse> {
  const res = await fetch(`${API_URL}/api/v1/ask`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "Failed to get answer.");
  }

  return res.json();
}
