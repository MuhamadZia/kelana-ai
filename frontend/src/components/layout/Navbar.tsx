"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <header className="w-full border-b border-maroon/10 bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left nav links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/"        className="text-sm text-maroon/70 hover:text-maroon transition-colors">Home</Link>
          <Link href="/history" className="text-sm text-maroon/70 hover:text-maroon transition-colors">History</Link>
          <a href="#"           className="text-sm text-maroon/70 hover:text-maroon transition-colors">Community</a>
          <a href="#"           className="text-sm text-maroon/70 hover:text-maroon transition-colors">Contacts</a>
        </nav>

        {/* Logo */}
        <Link href="/" className="flex flex-col items-center leading-none">
          <span className="font-serif text-xl font-bold text-maroon tracking-tight">
            <span className="text-orange">K</span>elana
          </span>
          <span className="text-xs font-semibold text-orange tracking-widest uppercase">AI</span>
        </Link>

        {/* Right: auth-aware */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-20 h-8 rounded-full bg-maroon/10 animate-pulse" />
          ) : user ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 text-sm text-maroon/70 hover:text-maroon transition-colors"
              >
                {/* Initials avatar */}
                <span className="w-7 h-7 rounded-full bg-orange/20 flex items-center justify-center text-xs font-bold text-orange">
                  {user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                </span>
                <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium border border-maroon/20 text-maroon/70 px-4 py-1.5 rounded-full hover:border-red-300 hover:text-red-500 transition-all"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-maroon/70 hover:text-maroon transition-colors">
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium border border-maroon text-maroon px-4 py-1.5 rounded-full hover:bg-maroon hover:text-cream transition-all"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
