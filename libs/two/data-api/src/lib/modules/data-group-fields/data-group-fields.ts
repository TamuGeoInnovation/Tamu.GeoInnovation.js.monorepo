import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataGroupFlds } from '@tamu-gisc/two/common';

import { DataGroupFieldsController } from './data-group-fields.controller';
import { DataGroupFieldsService } from './data-group-fields.service';

@Module({
  imports: [TypeOrmModule.forFeature([DataGroupFlds])],
  controllers: [DataGroupFieldsController],
  providers: [DataGroupFieldsService]
})
export class DataGroupFieldsModule {}
