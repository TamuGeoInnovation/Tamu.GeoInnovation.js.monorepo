import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Response } from '@tamu-gisc/cpa/common/entities';

import { LayersController } from './layers.controller';
import { LayersService } from './layers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Response])],
  controllers: [LayersController],
  providers: [LayersService]
})
export class LayersModule {}
