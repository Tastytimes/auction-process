import { AdminService } from './admin.service';
import { CreatePlayersDto } from './dto/create-players.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
export declare class AdminController {
    private readonly admin;
    constructor(admin: AdminService);
    teams(): Promise<({
        owners: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        }[];
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
    })[]>;
    createTeam(dto: CreateTeamDto): Promise<{
        owners: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        }[];
    } & {
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        purseTotal: number;
        purseRemaining: number;
    }>;
    players(): Promise<({
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
    })[]>;
    createPlayers(dto: CreatePlayersDto): Promise<{
        created: number;
        skipped: number;
    }>;
    settings(): Promise<{
        id: number;
        basePrice: number;
        stepBelowThreshold: number;
        threshold: number;
        stepAboveThreshold: number;
        updatedAt: Date;
    }>;
    updateSettings(dto: UpdateSettingsDto): Promise<{
        id: number;
        basePrice: number;
        stepBelowThreshold: number;
        threshold: number;
        stepAboveThreshold: number;
        updatedAt: Date;
    }>;
}
