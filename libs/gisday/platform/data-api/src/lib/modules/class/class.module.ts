import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClassRepo } from '../../entities/all.entity';
import { ClassController } from '../../controllers/class/class.controller';
import { ClassProvider } from '../../providers/class/class.provider';

@Module({
  imports: [TypeOrmModule.forFeature([ClassRepo])],
  controllers: [ClassController],
  providers: [ClassProvider],
  exports: [ClassProvider]
})
export class ClassModule {}
