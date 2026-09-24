import { IsOptional, IsString } from 'class-validator';

export class QueryEmployeeDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  project?: string;

  @IsOptional()
  @IsString()
  gradeBand?: string;

  @IsOptional()
  @IsString()
  managerId?: string;
}
