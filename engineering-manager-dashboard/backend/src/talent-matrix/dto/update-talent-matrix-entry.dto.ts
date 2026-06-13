import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Quarter } from '../../common/enums';

export class UpdateTalentMatrixEntryDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  potentialScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  performanceScore?: number;

  @IsOptional()
  @IsEnum(Quarter)
  quarter?: Quarter;

  @IsOptional()
  @IsInt()
  @Min(2000)
  year?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
