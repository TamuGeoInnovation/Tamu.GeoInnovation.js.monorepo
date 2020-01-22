import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Responses } from '@tamu-gisc/cpa/common/entities';

import { ResponsesService } from './responses.service';
import { ResponsesController } from './responses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Responses])],
  providers: [ResponsesService],
  controllers: [ResponsesController]
})
export class ResponsesModule {}
