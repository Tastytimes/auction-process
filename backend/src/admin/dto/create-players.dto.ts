import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class CreatePlayersDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  names!: string[];
}
