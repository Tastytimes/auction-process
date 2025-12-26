export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "http://localhost:3001";

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL?.replace(/\/+$/, "") ??
  "http://localhost:3001/ws";

