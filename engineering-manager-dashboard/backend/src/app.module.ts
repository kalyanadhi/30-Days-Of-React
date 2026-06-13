import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmployeesModule } from './employees/employees.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { GoalsModule } from './goals/goals.module';
import { AchievementsModule } from './achievements/achievements.module';
import { DevelopmentPlansModule } from './development-plans/development-plans.module';
import { OneOnOnesModule } from './one-on-ones/one-on-ones.module';
import { LearningModule } from './learning/learning.module';
import { PromotionReadinessModule } from './promotion-readiness/promotion-readiness.module';
import { TalentMatrixModule } from './talent-matrix/talent-matrix.module';
import { RiskModule } from './risk/risk.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';

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
    AuthModule,
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
    DashboardModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
