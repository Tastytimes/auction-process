export type Team = {
  id: string;
  name: string;
  purseTotal: number;
  purseRemaining: number;
  players?: Player[];
};

export type Player = {
  id: string;
  name: string;
  basePrice: number;
  status?: "UNSOLD" | "IN_AUCTION" | "SOLD" | string;
  soldPrice?: number | null;
  soldToTeam?: Team | null;
};

export type Settings = {
  basePrice: number;
  stepBelowThreshold: number;
  threshold: number;
  stepAboveThreshold: number;
};

export type AuctionState = {
  status: "IDLE" | "RUNNING" | string;
  currentPrice: number;
  currentPlayerId?: string | null;
  highestBidTeamId?: string | null;
  currentPlayer?: Player | null;
  highestBidTeam?: Pick<Team, "id" | "name"> | null;
};

export type AuctionPublicState = {
  settings: Settings;
  state: AuctionState | null;
};

export type ResultsResponse = {
  players: Player[];
  teams: Team[];
};

export type OwnerDashboardResponse = {
  team: (Team & { players: Player[] }) | null;
  upcomingPlayers: Player[];
  auctionState: AuctionPublicState;
};

