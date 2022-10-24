import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Class } from '../entities/all.entity';
import { ClassController } from './class.controller';
import { ClassProvider } from './class.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Class])],
  controllers: [ClassController],
  providers: [ClassProvider],
  exports: [ClassProvider]
})
export class ClassModule {}
