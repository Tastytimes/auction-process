import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTeamDto {
  @IsString()
  name!: string;

  /**
   * Purse in rupees (recommended to avoid floating point issues).
   * Example: 100 Cr => 100 * 10_000_000 = 1_000_000_000
   */
  @IsInt()
  @Min(0)
  purseTotal!: number;

  @IsEmail()
  ownerEmail!: string;

  @IsString()
  @MinLength(6)
  ownerPassword!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  purseRemaining?: number;
}
