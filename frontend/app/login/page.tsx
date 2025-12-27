"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { setSession, type AuthSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@auction.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<AuthSession>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setSession(res);
      router.push(res.user?.role === "ADMIN" ? "/admin" : "/owner");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold text-zinc-900">Auction Login</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Default admin: <span className="font-mono">admin@auction.local</span> /{" "}
          <span className="font-mono">admin123</span>
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl bg-white p-6 shadow">
          <label className="block">
            <div className="text-sm font-medium text-zinc-700">Email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:border-zinc-400"
              type="email"
              required
            />
          </label>

          <label className="block">
            <div className="text-sm font-medium text-zinc-700">Password</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:border-zinc-400"
              type="password"
              required
            />
          </label>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

