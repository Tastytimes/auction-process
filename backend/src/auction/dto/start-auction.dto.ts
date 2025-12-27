import { IsOptional, IsString } from 'class-validator';

export class StartAuctionDto {
  @IsOptional()
  @IsString()
  playerId?: string;
}
