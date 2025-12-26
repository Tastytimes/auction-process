import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  basePrice?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  stepBelowThreshold?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  threshold?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  stepAboveThreshold?: number;
}
