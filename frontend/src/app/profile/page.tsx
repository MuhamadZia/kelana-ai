"use client";

import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-14">
        <div className="max-w-xl mx-auto space-y-6">
          <h1 className="font-serif text-4xl font-bold text-maroon">Profile</h1>

          {/* Avatar + info card */}
          <div className="bg-white/60 backdrop-blur-sm border border-maroon/10 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-6 mb-8">
              {/* Avatar circle */}
              <div className="w-16 h-16 rounded-full bg-orange/20 flex items-center justify-center shrink-0">
                <span className="font-serif text-2xl font-bold text-orange">{initials}</span>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-maroon">{user.name}</p>
                <p className="text-sm text-maroon/50 mt-0.5">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoBlock label="Full Name" value={user.name} />
              <InfoBlock label="Email"     value={user.email} />
              <InfoBlock label="User ID"   value={`#${user.id}`} />
              <InfoBlock label="Status"    value="Active" />
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-white/60 backdrop-blur-sm border border-red-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-maroon/70 uppercase tracking-wider mb-4">
              Session
            </h2>
            <button
              onClick={logout}
              className="w-full border border-red-300 text-red-600 font-semibold rounded-xl py-2.5 text-sm hover:bg-red-50 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cream rounded-xl px-4 py-3">
      <p className="text-xs text-maroon/40 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-semibold text-maroon">{value}</p>
    </div>
  );
}
