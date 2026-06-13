import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateOneOnOneDto {
  @IsString()
  employeeId: string;

  @IsDateString()
  meetingDate: string;

  @IsOptional()
  @IsString()
  discussionNotes?: string;

  @IsOptional()
  @IsString()
  concerns?: string;

  @IsOptional()
  @IsString()
  careerDiscussion?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  actionItems?: string[];

  @IsOptional()
  @IsDateString()
  followUpDate?: string;
}
