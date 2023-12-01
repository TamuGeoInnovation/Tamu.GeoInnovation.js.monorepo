import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CheckIn, Class } from '../entities/all.entity';
import { ClassController } from './class.controller';
import { ClassProvider } from './class.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Class, CheckIn])],
  controllers: [ClassController],
  providers: [ClassProvider],
  exports: [ClassProvider]
})
export class ClassModule {}
