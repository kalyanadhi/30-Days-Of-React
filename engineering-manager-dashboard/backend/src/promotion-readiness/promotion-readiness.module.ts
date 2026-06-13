import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionReadiness } from './entities/promotion-readiness.entity';
import { PromotionReadinessService } from './promotion-readiness.service';
import { PromotionReadinessController } from './promotion-readiness.controller';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [TypeOrmModule.forFeature([PromotionReadiness]), EmployeesModule],
  controllers: [PromotionReadinessController],
  providers: [PromotionReadinessService],
  exports: [PromotionReadinessService],
})
export class PromotionReadinessModule {}
