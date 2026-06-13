import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TalentMatrixEntry } from './entities/talent-matrix-entry.entity';
import { TalentMatrixService } from './talent-matrix.service';
import { TalentMatrixController } from './talent-matrix.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TalentMatrixEntry])],
  controllers: [TalentMatrixController],
  providers: [TalentMatrixService],
  exports: [TalentMatrixService],
})
export class TalentMatrixModule {}
