import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Fields } from '@tamu-gisc/two/common';

import { FieldsController } from './fields.controller';
import { FieldsService } from './fields.service';

@Module({
  imports: [TypeOrmModule.forFeature([Fields])],
  controllers: [FieldsController],
  providers: [FieldsService]
})
export class FieldsModule {}
