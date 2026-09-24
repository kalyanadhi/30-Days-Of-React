import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OneOnOne } from './entities/one-on-one.entity';
import { OneOnOnesService } from './one-on-ones.service';
import { OneOnOnesController } from './one-on-ones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OneOnOne])],
  controllers: [OneOnOnesController],
  providers: [OneOnOnesService],
  exports: [OneOnOnesService],
})
export class OneOnOnesModule {}
