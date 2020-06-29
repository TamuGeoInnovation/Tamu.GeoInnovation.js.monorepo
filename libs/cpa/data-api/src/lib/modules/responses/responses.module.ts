import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Response } from '@tamu-gisc/cpa/common/entities';

import { ResponsesService } from './responses.service';
import { ResponsesController } from './responses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Response])],
  providers: [ResponsesService],
  controllers: [ResponsesController]
})
export class ResponsesModule {}
