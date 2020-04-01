import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { County, User } from '@tamu-gisc/covid/common/entities';

import { CountiesService } from './counties.service';
import { CountiesController } from './counties.controller';

@Module({
  imports: [TypeOrmModule.forFeature([County, User])],
  controllers: [CountiesController],
  providers: [CountiesService]
})
export class CountiesModule {}
