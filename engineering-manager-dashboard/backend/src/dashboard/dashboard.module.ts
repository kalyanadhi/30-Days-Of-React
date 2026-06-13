import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { EmployeesModule } from '../employees/employees.module';
import { EvaluationsModule } from '../evaluations/evaluations.module';
import { PromotionReadinessModule } from '../promotion-readiness/promotion-readiness.module';
import { RiskModule } from '../risk/risk.module';
import { DevelopmentPlansModule } from '../development-plans/development-plans.module';

@Module({
  imports: [
    EmployeesModule,
    EvaluationsModule,
    PromotionReadinessModule,
    RiskModule,
    DevelopmentPlansModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
