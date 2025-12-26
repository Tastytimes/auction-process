"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { clearSession, getSession } from "@/lib/auth";
import { formatCroresFromRupees } from "@/lib/money";
import { useAuctionSocket } from "@/lib/useAuctionSocket";
import type { OwnerDashboardResponse, Player } from "@/lib/types";

export default function OwnerPage() {
  const router = useRouter();
  const [session] = useState(() => getSession());
  const token = session?.accessToken ?? null;
  const { connected, auction } = useAuctionSocket(token);

  const [data, setData] = useState<OwnerDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user?.role !== "OWNER") {
      router.push("/admin");
      return;
    }
  }, [router, session]);

  async function refresh() {
    setError(null);
    try {
      const d = await apiFetch<OwnerDashboardResponse>("/owner/dashboard", { auth: true });
      setData(d);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function bid() {
    setError(null);
    setBusy(true);
    try {
      await apiFetch("/auction/bid", { auth: true, method: "POST", body: "{}" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Bid failed");
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    clearSession();
    router.push("/login");
  }

  const team = data?.team;
  const upcoming = data?.upcomingPlayers ?? [];

  const state = auction?.state;
  const currentPlayer = state?.currentPlayer;
  const highestTeam = state?.highestBidTeam;
  const isRunning = state?.status === "RUNNING";

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Owner Dashboard</h1>
            <div className="mt-1 text-sm text-zinc-600">
              Team: <span className="font-medium">{team?.name ?? "-"}</span> • WS:{" "}
              {connected ? "connected" : "disconnected"}
            </div>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
          >
            Logout
          </button>
        </div>

        {error ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-zinc-900">Live Auction</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div>
                <span className="text-zinc-600">Player:</span>{" "}
                <span className="font-medium">{currentPlayer?.name ?? "-"}</span>
              </div>
              <div>
                <span className="text-zinc-600">Current price:</span>{" "}
                <span className="font-medium">
                  {formatCroresFromRupees(state?.currentPrice)}
                </span>
              </div>
              <div>
                <span className="text-zinc-600">Highest team:</span>{" "}
                <span className="font-medium">{highestTeam?.name ?? "-"}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                disabled={!isRunning || busy}
                onClick={bid}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                {busy ? "Bidding..." : "Bid (next increment)"}
              </button>
              <button
                onClick={refresh}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-zinc-900">My Purse</h2>
            <div className="mt-4 text-sm">
              <div>
                <span className="text-zinc-600">Remaining:</span>{" "}
                <span className="font-medium">
                  {formatCroresFromRupees(team?.purseRemaining)}
                </span>
              </div>
              <div className="mt-1">
                <span className="text-zinc-600">Total:</span>{" "}
                <span className="font-medium">{formatCroresFromRupees(team?.purseTotal)}</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-medium text-zinc-700">My Players</div>
              <ul className="mt-2 space-y-1 text-sm">
                {team?.players?.map((p: Player) => (
                  <li key={p.id} className="flex justify-between rounded-lg bg-zinc-50 px-3 py-2">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-zinc-600">{formatCroresFromRupees(p.soldPrice)}</span>
                  </li>
                ))}
                {!team?.players?.length ? (
                  <li className="text-zinc-600">No players bought yet.</li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-zinc-900">Upcoming Players</h2>
          <div className="mt-2 text-sm text-zinc-600">
            Next: <span className="font-medium">{upcoming?.[0]?.name ?? "-"}</span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.slice(0, 12).map((p: Player) => (
              <div key={p.id} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm">
                <div className="font-medium">{p.name}</div>
                <div className="text-zinc-600">Base: {formatCroresFromRupees(p.basePrice)}</div>
              </div>
            ))}
            {!upcoming.length ? <div className="text-sm text-zinc-600">No upcoming players.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

