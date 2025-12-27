"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const auction_gateway_1 = require("./auction.gateway");
const RUPEES_PER_CRORE = 10_000_000;
let AuctionService = class AuctionService {
    prisma;
    gateway;
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    async getSettings() {
        return this.prisma.settings.upsert({
            where: { id: 1 },
            update: {},
            create: { id: 1 },
        });
    }
    async getState() {
        return this.prisma.auctionState.upsert({
            where: { id: 1 },
            update: {},
            create: { id: 1 },
        });
    }
    computeStep(currentPrice, threshold, below, above) {
        return currentPrice < threshold ? below : above;
    }
    async broadcastState() {
        const state = await this.getPublicState();
        this.gateway.emitAuctionState(state);
    }
    async getPublicState() {
        const state = await this.prisma.auctionState.findUnique({
            where: { id: 1 },
            include: {
                currentPlayer: true,
                highestBidTeam: true,
            },
        });
        const settings = await this.getSettings();
        return {
            settings,
            state,
        };
    }
    async listUpcomingPlayers() {
        return this.prisma.player.findMany({
            where: { status: client_1.PlayerStatus.UNSOLD },
            orderBy: { createdAt: 'asc' },
        });
    }
    async listResults() {
        const players = await this.prisma.player.findMany({
            where: { status: client_1.PlayerStatus.SOLD },
            include: { soldToTeam: true },
            orderBy: { updatedAt: 'desc' },
        });
        const teams = await this.prisma.team.findMany({ orderBy: { name: 'asc' } });
        return { players, teams };
    }
    async startAuction(user, playerId) {
        if (user.role !== client_1.Role.ADMIN)
            throw new common_1.ForbiddenException();
        const settings = await this.getSettings();
        const state = await this.getState();
        if (state.status === client_1.AuctionStatus.RUNNING) {
            throw new common_1.BadRequestException('Auction already running');
        }
        const player = (playerId
            ? await this.prisma.player.findUnique({ where: { id: playerId } })
            : await this.prisma.player.findFirst({
                where: { status: client_1.PlayerStatus.UNSOLD },
                orderBy: { createdAt: 'asc' },
            })) ?? null;
        if (!player)
            throw new common_1.NotFoundException('No player available for auction');
        if (player.status !== client_1.PlayerStatus.UNSOLD) {
            throw new common_1.BadRequestException('Player not available for auction');
        }
        const startPrice = Math.max(settings.basePrice, player.basePrice, RUPEES_PER_CRORE);
        await this.prisma.$transaction([
            this.prisma.player.update({
                where: { id: player.id },
                data: { status: client_1.PlayerStatus.IN_AUCTION },
            }),
            this.prisma.auctionState.update({
                where: { id: 1 },
                data: {
                    status: client_1.AuctionStatus.RUNNING,
                    currentPlayerId: player.id,
                    currentPrice: startPrice,
                    highestBidTeamId: null,
                },
            }),
        ]);
        await this.broadcastState();
        return this.getPublicState();
    }
    async placeBid(user, requestedAmount) {
        if (user.role !== client_1.Role.OWNER)
            throw new common_1.ForbiddenException();
        if (!user.teamId)
            throw new common_1.BadRequestException('Owner does not have a team');
        const settings = await this.getSettings();
        const state = await this.prisma.auctionState.findUnique({
            where: { id: 1 },
            include: { currentPlayer: true, highestBidTeam: true },
        });
        if (!state ||
            state.status !== client_1.AuctionStatus.RUNNING ||
            !state.currentPlayerId) {
            throw new common_1.BadRequestException('No active auction');
        }
        const team = await this.prisma.team.findUnique({
            where: { id: user.teamId },
        });
        if (!team)
            throw new common_1.BadRequestException('Team not found');
        const step = this.computeStep(state.currentPrice, settings.threshold, settings.stepBelowThreshold, settings.stepAboveThreshold);
        const nextAmount = state.currentPrice + step;
        if (requestedAmount != null && requestedAmount !== nextAmount) {
            throw new common_1.BadRequestException(`Next bid must be exactly ${nextAmount}`);
        }
        if (team.purseRemaining < nextAmount) {
            throw new common_1.BadRequestException('Insufficient purse for this bid');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const updatedState = await tx.auctionState.update({
                where: { id: 1 },
                data: { currentPrice: nextAmount, highestBidTeamId: team.id },
                include: { currentPlayer: true, highestBidTeam: true },
            });
            await tx.bid.create({
                data: {
                    playerId: updatedState.currentPlayerId,
                    teamId: team.id,
                    amount: nextAmount,
                },
            });
            return updatedState;
        });
        this.gateway.emitBidEvent({
            playerId: updated.currentPlayerId,
            teamId: updated.highestBidTeamId,
            amount: updated.currentPrice,
        });
        await this.broadcastState();
        return { ok: true };
    }
    async closeAuction(user) {
        if (user.role !== client_1.Role.ADMIN)
            throw new common_1.ForbiddenException();
        const state = await this.prisma.auctionState.findUnique({
            where: { id: 1 },
        });
        if (!state ||
            state.status !== client_1.AuctionStatus.RUNNING ||
            !state.currentPlayerId) {
            throw new common_1.BadRequestException('No active auction');
        }
        const player = await this.prisma.player.findUnique({
            where: { id: state.currentPlayerId },
        });
        if (!player)
            throw new common_1.NotFoundException('Current player not found');
        if (!state.highestBidTeamId) {
            await this.prisma.$transaction([
                this.prisma.player.update({
                    where: { id: player.id },
                    data: { status: client_1.PlayerStatus.UNSOLD },
                }),
                this.prisma.auctionState.update({
                    where: { id: 1 },
                    data: {
                        status: client_1.AuctionStatus.IDLE,
                        currentPlayerId: null,
                        currentPrice: 0,
                        highestBidTeamId: null,
                    },
                }),
            ]);
            await this.broadcastState();
            return { sold: false };
        }
        const team = await this.prisma.team.findUnique({
            where: { id: state.highestBidTeamId },
        });
        if (!team)
            throw new common_1.BadRequestException('Highest bid team not found');
        if (team.purseRemaining < state.currentPrice) {
            throw new common_1.BadRequestException('Highest bid team has insufficient purse');
        }
        await this.prisma.$transaction([
            this.prisma.player.update({
                where: { id: player.id },
                data: {
                    status: client_1.PlayerStatus.SOLD,
                    soldPrice: state.currentPrice,
                    soldToTeamId: team.id,
                },
            }),
            this.prisma.team.update({
                where: { id: team.id },
                data: { purseRemaining: { decrement: state.currentPrice } },
            }),
            this.prisma.auctionState.update({
                where: { id: 1 },
                data: {
                    status: client_1.AuctionStatus.IDLE,
                    currentPlayerId: null,
                    currentPrice: 0,
                    highestBidTeamId: null,
                },
            }),
        ]);
        await this.broadcastState();
        return { sold: true, playerId: player.id, teamId: team.id };
    }
};
exports.AuctionService = AuctionService;
exports.AuctionService = AuctionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auction_gateway_1.AuctionGateway])
], AuctionService);
//# sourceMappingURL=auction.service.js.map