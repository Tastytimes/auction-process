import { IsInt, IsOptional, Min } from 'class-validator';

export class PlaceBidDto {
  /**
   * If omitted, server will auto-bid the exact next increment.
   * If provided, must equal the exact next increment.
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  amount?: number;
}
