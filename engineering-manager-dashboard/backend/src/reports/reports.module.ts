import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { EmployeesModule } from '../employees/employees.module';
import { EvaluationsModule } from '../evaluations/evaluations.module';
import { PromotionReadinessModule } from '../promotion-readiness/promotion-readiness.module';
import { TalentMatrixModule } from '../talent-matrix/talent-matrix.module';
import { LearningModule } from '../learning/learning.module';
import { RiskModule } from '../risk/risk.module';

@Module({
  imports: [
    EmployeesModule,
    EvaluationsModule,
    PromotionReadinessModule,
    TalentMatrixModule,
    LearningModule,
    RiskModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
