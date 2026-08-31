import Cookies from "js-cookie";
import type { AuthResponse, LoginPayload, RegisterPayload, User } from "@/types/auth";

const API_URL    = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TOKEN_KEY  = "kelana_token";

// ── Token helpers ──────────────────────────────────────────────────────────────

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function setToken(token: string): void {
  // expires in 1 day, accessible only on same site
  Cookies.set(TOKEN_KEY, token, { expires: 1, sameSite: "strict" });
}

export function removeToken(): void {
  Cookies.remove(TOKEN_KEY);
}

// ── Auth headers helper ────────────────────────────────────────────────────────

export function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── API calls ──────────────────────────────────────────────────────────────────

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "Registration failed.");
  }
  return res.json();
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "Login failed.");
  }
  return res.json();
}

export async function getMe(): Promise<User> {
  const res = await fetch(`${API_URL}/api/v1/auth/me`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch user.");
  return res.json();
}
