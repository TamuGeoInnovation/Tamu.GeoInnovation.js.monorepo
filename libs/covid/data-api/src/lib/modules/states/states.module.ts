import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { State } from '@tamu-gisc/covid/common/entities';

import { StatesService } from './states.service';
import { StatesController } from './states.controller';

@Module({
  imports: [TypeOrmModule.forFeature([State])],
  controllers: [StatesController],
  providers: [StatesService]
})
export class StatesModule {}
