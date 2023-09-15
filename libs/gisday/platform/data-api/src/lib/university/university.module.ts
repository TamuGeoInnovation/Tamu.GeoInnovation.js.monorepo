import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UniversityController } from './university.controller';
import { University } from '../entities/all.entity';
import { UniversityProvider } from './university.provider';

@Module({
  imports: [TypeOrmModule.forFeature([University])],
  exports: [],
  controllers: [UniversityController],
  providers: [UniversityProvider]
})
export class UniversityModule {}
