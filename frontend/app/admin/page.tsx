"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { clearSession, getSession } from "@/lib/auth";
import { croresToRupees, formatCroresFromRupees } from "@/lib/money";
import { useAuctionSocket } from "@/lib/useAuctionSocket";
import type { Player, ResultsResponse, Team } from "@/lib/types";

export default function AdminPage() {
  const router = useRouter();
  const [session] = useState(() => getSession());
  const token = session?.accessToken ?? null;
  const { connected, auction } = useAuctionSocket(token);

  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [results, setResults] = useState<ResultsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [teamName, setTeamName] = useState("");
  const [teamPurseCr, setTeamPurseCr] = useState<number>(100);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");

  const [playersText, setPlayersText] = useState("");

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user?.role !== "ADMIN") {
      router.push("/owner");
      return;
    }
  }, [router, session]);

  async function refresh() {
    setError(null);
    try {
      const [t, p, r] = await Promise.all([
        apiFetch<Team[]>("/admin/teams", { auth: true }),
        apiFetch<Player[]>("/admin/players", { auth: true }),
        apiFetch<ResultsResponse>("/auction/results"),
      ]);
      setTeams(t);
      setPlayers(p);
      setResults(r);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, []);

  async function onCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch("/admin/teams", {
        auth: true,
        method: "POST",
        body: JSON.stringify({
          name: teamName,
          purseTotal: croresToRupees(teamPurseCr),
          ownerEmail,
          ownerPassword,
        }),
      });
      setTeamName("");
      setOwnerEmail("");
      setOwnerPassword("");
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create team");
    }
  }

  async function onAddPlayers(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const names = playersText
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);
      await apiFetch("/admin/players", {
        auth: true,
        method: "POST",
        body: JSON.stringify({ names }),
      });
      setPlayersText("");
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add players");
    }
  }

  async function startNext() {
    setError(null);
    try {
      await apiFetch("/auction/start", { auth: true, method: "POST", body: "{}" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to start auction");
    }
  }

  async function closeAuction() {
    setError(null);
    try {
      await apiFetch("/auction/close", { auth: true, method: "POST", body: "{}" });
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to close auction");
    }
  }

  function logout() {
    clearSession();
    router.push("/login");
  }

  const state = auction?.state;
  const currentPlayer = state?.currentPlayer;
  const highestTeam = state?.highestBidTeam;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Admin Dashboard</h1>
            <div className="mt-1 text-sm text-zinc-600">
              WS: {connected ? "connected" : "disconnected"}
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
                onClick={startNext}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white"
              >
                Start next player
              </button>
              <button
                onClick={closeAuction}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm"
              >
                Close & sell
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-zinc-900">Create Team</h2>
            <form onSubmit={onCreateTeam} className="mt-4 space-y-3">
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team name"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                required
              />
              <input
                value={teamPurseCr}
                onChange={(e) => setTeamPurseCr(Number(e.target.value))}
                placeholder="Purse (in Cr)"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                type="number"
                min={0}
                step={1}
                required
              />
              <input
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="Owner email"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                type="email"
                required
              />
              <input
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                placeholder="Owner password"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                type="password"
                required
              />
              <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">
                Create team
              </button>
            </form>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-zinc-900">Add Players</h2>
            <form onSubmit={onAddPlayers} className="mt-4 space-y-3">
              <textarea
                value={playersText}
                onChange={(e) => setPlayersText(e.target.value)}
                placeholder={"One player per line...\nVirat Kohli\nRohit Sharma"}
                className="h-40 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
              <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">
                Add players
              </button>
            </form>
            <div className="mt-3 text-xs text-zinc-600">
              Total players: <span className="font-medium">{players.length}</span>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-zinc-900">Teams / Purse</h2>
            <div className="mt-4 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-zinc-600">
                  <tr>
                    <th className="py-2 pr-3">Team</th>
                    <th className="py-2 pr-3">Remaining</th>
                    <th className="py-2 pr-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t) => (
                    <tr key={t.id} className="border-t border-zinc-100">
                      <td className="py-2 pr-3 font-medium">{t.name}</td>
                      <td className="py-2 pr-3">{formatCroresFromRupees(t.purseRemaining)}</td>
                      <td className="py-2 pr-3">{formatCroresFromRupees(t.purseTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-zinc-900">Sold Players</h2>
          <div className="mt-4 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-zinc-600">
                <tr>
                  <th className="py-2 pr-3">Player</th>
                  <th className="py-2 pr-3">Team</th>
                  <th className="py-2 pr-3">Price</th>
                </tr>
              </thead>
              <tbody>
                {results?.players?.map((p: Player) => (
                  <tr key={p.id} className="border-t border-zinc-100">
                    <td className="py-2 pr-3 font-medium">{p.name}</td>
                    <td className="py-2 pr-3">{p.soldToTeam?.name ?? "-"}</td>
                    <td className="py-2 pr-3">{formatCroresFromRupees(p.soldPrice)}</td>
                  </tr>
                ))}
                {!results?.players?.length ? (
                  <tr>
                    <td className="py-3 text-zinc-600" colSpan={3}>
                      No sold players yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

