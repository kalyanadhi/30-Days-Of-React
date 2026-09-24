import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevelopmentPlan } from './entities/development-plan.entity';
import { DevelopmentPlansService } from './development-plans.service';
import { DevelopmentPlansController } from './development-plans.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DevelopmentPlan])],
  controllers: [DevelopmentPlansController],
  providers: [DevelopmentPlansService],
  exports: [DevelopmentPlansService],
})
export class DevelopmentPlansModule {}
