"use client";

import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import { WS_URL } from "./env";
import type { AuctionPublicState } from "./types";

export type BidEvent = {
  playerId?: string;
  teamId?: string;
  amount?: number;
};

export function useAuctionSocket(accessToken: string | null) {
  const [connected, setConnected] = useState(false);
  const [auction, setAuction] = useState<AuctionPublicState | null>(null);
  const [lastBid, setLastBid] = useState<BidEvent | null>(null);

  const socketKey = useMemo(() => accessToken ?? "", [accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    const socket: Socket = io(WS_URL, {
      auth: { token: accessToken },
    });

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("auction:state", (data: AuctionPublicState) => setAuction(data));
    socket.on("auction:bid", (data: BidEvent) => setLastBid(data));

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();
    };
  }, [socketKey, accessToken]);

  return { connected, auction, lastBid };
}

