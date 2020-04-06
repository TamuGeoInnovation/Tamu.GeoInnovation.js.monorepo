import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RestrictionType } from '@tamu-gisc/covid/common/entities';

import { RestrictionsService } from './restrictions.service';
import { RestrictionsController } from './restrictions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RestrictionType])],
  controllers: [RestrictionsController],
  providers: [RestrictionsService]
})
export class RestrictionsModule {}
