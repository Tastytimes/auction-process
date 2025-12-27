import { PrismaService } from '../prisma/prisma.service';
import { AuctionService } from '../auction/auction.service';
export declare class OwnerController {
    private readonly prisma;
    private readonly auction;
    constructor(prisma: PrismaService, auction: AuctionService);
    dashboard(user: any): Promise<{
        team: null;
        upcomingPlayers?: undefined;
        auctionState?: undefined;
    } | {
        team: ({
            players: {
                id: string;
                basePrice: number;
                updatedAt: Date;
                name: string;
                status: import("@prisma/client").$Enums.PlayerStatus;
                createdAt: Date;
                soldPrice: number | null;
                soldToTeamId: string | null;
            }[];
        } & {
            id: string;
            updatedAt: Date;
            name: string;
            createdAt: Date;
            purseTotal: number;
            purseRemaining: number;
        }) | null;
        upcomingPlayers: {
            id: string;
            basePrice: number;
            updatedAt: Date;
            name: string;
            status: import("@prisma/client").$Enums.PlayerStatus;
            createdAt: Date;
            soldPrice: number | null;
            soldToTeamId: string | null;
        }[];
        auctionState: {
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
        };
    }>;
}
