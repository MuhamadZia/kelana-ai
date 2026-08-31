"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types/auth";
import {
  getMe,
  getToken,
  setToken,
  removeToken,
  login as apiLogin,
  register as apiRegister,
} from "@/services/authService";
import type { LoginPayload, RegisterPayload } from "@/types/auth";

interface AuthContextValue {
  user:     User | null;
  loading:  boolean;
  login:    (payload: LoginPayload)    => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout:   () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: rehydrate user from stored token
  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }

    getMe()
      .then(setUser)
      .catch(() => removeToken())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { access_token } = await apiLogin(payload);
    setToken(access_token);
    const me = await getMe();
    setUser(me);
    router.push("/");
  }, [router]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { access_token } = await apiRegister(payload);
    setToken(access_token);
    const me = await getMe();
    setUser(me);
    router.push("/");
  }, [router]);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
