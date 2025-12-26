import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuctionController } from './auction.controller';
import { AuctionGateway } from './auction.gateway';
import { AuctionService } from './auction.service';

@Module({
  imports: [AuthModule],
  controllers: [AuctionController],
  providers: [AuctionService, AuctionGateway],
  exports: [AuctionService],
})
export class AuctionModule {}
