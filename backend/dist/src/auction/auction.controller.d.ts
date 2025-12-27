import { type AuthenticatedUser } from '../common/current-user.decorator';
import { AuctionService } from './auction.service';
import { PlaceBidDto } from './dto/place-bid.dto';
import { StartAuctionDto } from './dto/start-auction.dto';
export declare class AuctionController {
    private readonly auction;
    constructor(auction: AuctionService);
    getState(): Promise<{
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
    upcoming(): Promise<{
        id: string;
        basePrice: number;
        updatedAt: Date;
        name: string;
        status: import("@prisma/client").$Enums.PlayerStatus;
        createdAt: Date;
        soldPrice: number | null;
        soldToTeamId: string | null;
    }[]>;
    results(): Promise<{
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
    start(user: AuthenticatedUser, dto: StartAuctionDto): Promise<{
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
    close(user: AuthenticatedUser): Promise<{
        sold: boolean;
        playerId?: undefined;
        teamId?: undefined;
    } | {
        sold: boolean;
        playerId: string;
        teamId: string;
    }>;
    bid(user: AuthenticatedUser, dto: PlaceBidDto): Promise<{
        ok: boolean;
    }>;
}
