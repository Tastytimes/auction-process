import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuctionStatus, PlayerStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuctionGateway } from './auction.gateway';

const RUPEES_PER_CRORE = 10_000_000;

@Injectable()
export class AuctionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AuctionGateway,
  ) {}

  private async getSettings() {
    return this.prisma.settings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
  }

  private async getState() {
    return this.prisma.auctionState.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
  }

  private computeStep(
    currentPrice: number,
    threshold: number,
    below: number,
    above: number,
  ) {
    return currentPrice < threshold ? below : above;
  }

  private async broadcastState() {
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
      where: { status: PlayerStatus.UNSOLD },
      orderBy: { createdAt: 'asc' },
    });
  }

  async listResults() {
    const players = await this.prisma.player.findMany({
      where: { status: PlayerStatus.SOLD },
      include: { soldToTeam: true },
      orderBy: { updatedAt: 'desc' },
    });

    const teams = await this.prisma.team.findMany({ orderBy: { name: 'asc' } });
    return { players, teams };
  }

  async startAuction(user: { role: string }, playerId?: string) {
    if (user.role !== Role.ADMIN) throw new ForbiddenException();

    const settings = await this.getSettings();
    const state = await this.getState();
    if (state.status === AuctionStatus.RUNNING) {
      throw new BadRequestException('Auction already running');
    }

    const player =
      (playerId
        ? await this.prisma.player.findUnique({ where: { id: playerId } })
        : await this.prisma.player.findFirst({
            where: { status: PlayerStatus.UNSOLD },
            orderBy: { createdAt: 'asc' },
          })) ?? null;

    if (!player) throw new NotFoundException('No player available for auction');
    if (player.status !== PlayerStatus.UNSOLD) {
      throw new BadRequestException('Player not available for auction');
    }

    const startPrice = Math.max(
      settings.basePrice,
      player.basePrice,
      RUPEES_PER_CRORE,
    );

    await this.prisma.$transaction([
      this.prisma.player.update({
        where: { id: player.id },
        data: { status: PlayerStatus.IN_AUCTION },
      }),
      this.prisma.auctionState.update({
        where: { id: 1 },
        data: {
          status: AuctionStatus.RUNNING,
          currentPlayerId: player.id,
          currentPrice: startPrice,
          highestBidTeamId: null,
        },
      }),
    ]);

    await this.broadcastState();
    return this.getPublicState();
  }

  async placeBid(
    user: { role: string; teamId?: string | null },
    requestedAmount?: number,
  ) {
    if (user.role !== Role.OWNER) throw new ForbiddenException();
    if (!user.teamId)
      throw new BadRequestException('Owner does not have a team');

    const settings = await this.getSettings();
    const state = await this.prisma.auctionState.findUnique({
      where: { id: 1 },
      include: { currentPlayer: true, highestBidTeam: true },
    });
    if (
      !state ||
      state.status !== AuctionStatus.RUNNING ||
      !state.currentPlayerId
    ) {
      throw new BadRequestException('No active auction');
    }

    const team = await this.prisma.team.findUnique({
      where: { id: user.teamId },
    });
    if (!team) throw new BadRequestException('Team not found');

    const step = this.computeStep(
      state.currentPrice,
      settings.threshold,
      settings.stepBelowThreshold,
      settings.stepAboveThreshold,
    );
    const nextAmount = state.currentPrice + step;

    if (requestedAmount != null && requestedAmount !== nextAmount) {
      throw new BadRequestException(`Next bid must be exactly ${nextAmount}`);
    }

    if (team.purseRemaining < nextAmount) {
      throw new BadRequestException('Insufficient purse for this bid');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedState = await tx.auctionState.update({
        where: { id: 1 },
        data: { currentPrice: nextAmount, highestBidTeamId: team.id },
        include: { currentPlayer: true, highestBidTeam: true },
      });

      await tx.bid.create({
        data: {
          playerId: updatedState.currentPlayerId!,
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

  async closeAuction(user: { role: string }) {
    if (user.role !== Role.ADMIN) throw new ForbiddenException();

    const state = await this.prisma.auctionState.findUnique({
      where: { id: 1 },
    });
    if (
      !state ||
      state.status !== AuctionStatus.RUNNING ||
      !state.currentPlayerId
    ) {
      throw new BadRequestException('No active auction');
    }

    const player = await this.prisma.player.findUnique({
      where: { id: state.currentPlayerId },
    });
    if (!player) throw new NotFoundException('Current player not found');

    if (!state.highestBidTeamId) {
      await this.prisma.$transaction([
        this.prisma.player.update({
          where: { id: player.id },
          data: { status: PlayerStatus.UNSOLD },
        }),
        this.prisma.auctionState.update({
          where: { id: 1 },
          data: {
            status: AuctionStatus.IDLE,
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
    if (!team) throw new BadRequestException('Highest bid team not found');
    if (team.purseRemaining < state.currentPrice) {
      throw new BadRequestException('Highest bid team has insufficient purse');
    }

    await this.prisma.$transaction([
      this.prisma.player.update({
        where: { id: player.id },
        data: {
          status: PlayerStatus.SOLD,
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
          status: AuctionStatus.IDLE,
          currentPlayerId: null,
          currentPrice: 0,
          highestBidTeamId: null,
        },
      }),
    ]);

    await this.broadcastState();
    return { sold: true, playerId: player.id, teamId: team.id };
  }
}
