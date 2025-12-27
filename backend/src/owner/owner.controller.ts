import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/current-user.decorator';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import { AuctionService } from '../auction/auction.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER')
@Controller('owner')
export class OwnerController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auction: AuctionService,
  ) {}

  @Get('dashboard')
  async dashboard(@CurrentUser() user: AuthenticatedUser) {
    const teamId = user.teamId ?? undefined;
    if (!teamId) return { team: null };

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { players: true },
    });
    const upcomingPlayers = await this.prisma.player.findMany({
      where: { status: 'UNSOLD' },
      orderBy: { createdAt: 'asc' },
    });
    const auctionState = await this.auction.getPublicState();

    return {
      team,
      upcomingPlayers,
      auctionState,
    };
  }
}
