import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/current-user.decorator';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuctionService } from './auction.service';
import { PlaceBidDto } from './dto/place-bid.dto';
import { StartAuctionDto } from './dto/start-auction.dto';

@Controller('auction')
export class AuctionController {
  constructor(private readonly auction: AuctionService) {}

  @Get('state')
  getState() {
    return this.auction.getPublicState();
  }

  @Get('upcoming')
  upcoming() {
    return this.auction.listUpcomingPlayers();
  }

  @Get('results')
  results() {
    return this.auction.listResults();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('start')
  start(@CurrentUser() user: AuthenticatedUser, @Body() dto: StartAuctionDto) {
    return this.auction.startAuction(user, dto.playerId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('close')
  close(@CurrentUser() user: AuthenticatedUser) {
    return this.auction.closeAuction(user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @Post('bid')
  bid(@CurrentUser() user: AuthenticatedUser, @Body() dto: PlaceBidDto) {
    return this.auction.placeBid(user, dto.amount);
  }
}
