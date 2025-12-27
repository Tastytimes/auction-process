import { Module } from '@nestjs/common';
import { AuctionModule } from '../auction/auction.module';
import { OwnerController } from './owner.controller';

@Module({
  imports: [AuctionModule],
  controllers: [OwnerController],
})
export class OwnerModule {}
