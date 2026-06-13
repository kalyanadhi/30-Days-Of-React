import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from '../../config/configuration';
import { typeOrmConfig } from '../../config/typeorm.config';
import { UsersModule } from '../../users/users.module';
import { EmployeesModule } from '../../employees/employees.module';
import { EvaluationsModule } from '../../evaluations/evaluations.module';
import { GoalsModule } from '../../goals/goals.module';
import { AchievementsModule } from '../../achievements/achievements.module';
import { DevelopmentPlansModule } from '../../development-plans/development-plans.module';
import { OneOnOnesModule } from '../../one-on-ones/one-on-ones.module';
import { LearningModule } from '../../learning/learning.module';
import { PromotionReadinessModule } from '../../promotion-readiness/promotion-readiness.module';
import { TalentMatrixModule } from '../../talent-matrix/talent-matrix.module';
import { RiskModule } from '../../risk/risk.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { SeedService } from './seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    UsersModule,
    EmployeesModule,
    EvaluationsModule,
    GoalsModule,
    AchievementsModule,
    DevelopmentPlansModule,
    OneOnOnesModule,
    LearningModule,
    PromotionReadinessModule,
    TalentMatrixModule,
    RiskModule,
    NotificationsModule,
  ],
  providers: [SeedService],
})
export class SeedModule {}
