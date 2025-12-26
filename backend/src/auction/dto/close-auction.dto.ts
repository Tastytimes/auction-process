import { IsOptional, IsBoolean } from 'class-validator';

export class CloseAuctionDto {
  /**
   * If true and there is no highest bid, mark player UNSOLD and keep in list.
   * (Default behavior is already to mark UNSOLD when no bids exist.)
   */
  @IsOptional()
  @IsBoolean()
  allowUnsold?: boolean;
}
