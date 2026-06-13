import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePromotionReadinessDto {
  @IsString()
  employeeId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  technicalCapability: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  leadership: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  ownership: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  delivery: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  influence: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  communication: number;

  @IsString()
  assessmentDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
