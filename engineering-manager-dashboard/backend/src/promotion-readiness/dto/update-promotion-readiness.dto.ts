import { PartialType } from '@nestjs/swagger';
import { CreatePromotionReadinessDto } from './create-promotion-readiness.dto';

export class UpdatePromotionReadinessDto extends PartialType(CreatePromotionReadinessDto) {}
