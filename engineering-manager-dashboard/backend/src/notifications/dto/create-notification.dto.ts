import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationType } from '../../common/enums';

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  relatedEntityId?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;
}
