import { PrismaService } from '../prisma/prisma.service';
import { AuctionGateway } from './auction.gateway';
export declare class AuctionService {
    private readonly prisma;
    private readonly gateway;
    constructor(prisma: PrismaService, gateway: AuctionGateway);
    private getSettings;
    private getState;
    private computeStep;
    private broadcastState;
    getPublicState(): Promise<{
        settings: {
            id: number;
            basePrice: number;
            stepBelowThreshold: number;
            threshold: number;
            stepAboveThreshold: number;
            updatedAt: Date;
        };
        state: ({
            currentPlayer: {
                id: string;
                basePrice: number;
                updatedAt: Date;
                name: string;
                status: import("@prisma/client").$Enums.PlayerStatus;
                createdAt: Date;
                soldPrice: number | null;
                soldToTeamId: string | null;
            } | null;
            highestBidTeam: {
                id: string;
                updatedAt: Date;
                name: string;
                createdAt: Date;
                purseTotal: number;
                purseRemaining: number;
            } | null;
        } & {
            id: number;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.AuctionStatus;
            currentPlayerId: string | null;
            currentPrice: number;
            highestBidTeamId: string | null;
        }) | null;
    }>;
    listUpcomingPlayers(): Promise<{
        id: string;
        basePrice: number;
        updatedAt: Date;
        name: string;
        status: import("@prisma/client").$Enums.PlayerStatus;
        createdAt: Date;
        soldPrice: number | null;
        soldToTeamId: string | null;
    }[]>;
    listResults(): Promise<{
        players: ({
            soldToTeam: {
                id: string;
                updatedAt: Date;
                name: string;
                createdAt: Date;
                purseTotal: number;
                purseRemaining: number;
            } | null;
        } & {
            id: string;
            basePrice: number;
            updatedAt: Date;
            name: string;
            status: import("@prisma/client").$Enums.PlayerStatus;
            createdAt: Date;
            soldPrice: number | null;
            soldToTeamId: string | null;
        })[];
        teams: {
            id: string;
            updatedAt: Date;
            name: string;
            createdAt: Date;
            purseTotal: number;
            purseRemaining: number;
        }[];
    }>;
    startAuction(user: {
        role: string;
    }, playerId?: string): Promise<{
        settings: {
            id: number;
            basePrice: number;
            stepBelowThreshold: number;
            threshold: number;
            stepAboveThreshold: number;
            updatedAt: Date;
        };
        state: ({
            currentPlayer: {
                id: string;
                basePrice: number;
                updatedAt: Date;
                name: string;
                status: import("@prisma/client").$Enums.PlayerStatus;
                createdAt: Date;
                soldPrice: number | null;
                soldToTeamId: string | null;
            } | null;
            highestBidTeam: {
                id: string;
                updatedAt: Date;
                name: string;
                createdAt: Date;
                purseTotal: number;
                purseRemaining: number;
            } | null;
        } & {
            id: number;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.AuctionStatus;
            currentPlayerId: string | null;
            currentPrice: number;
            highestBidTeamId: string | null;
        }) | null;
    }>;
    placeBid(user: {
        role: string;
        teamId?: string | null;
    }, requestedAmount?: number): Promise<{
        ok: boolean;
    }>;
    closeAuction(user: {
        role: string;
    }): Promise<{
        sold: boolean;
        playerId?: undefined;
        teamId?: undefined;
    } | {
        sold: boolean;
        playerId: string;
        teamId: string;
    }>;
}
