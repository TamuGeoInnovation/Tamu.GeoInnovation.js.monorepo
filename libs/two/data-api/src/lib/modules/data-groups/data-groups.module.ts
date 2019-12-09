import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataGroups } from '@tamu-gisc/two/common';

import { DataGroupsController } from './data-groups.controller';
import { DataGroupsService } from './data-groups.service';

@Module({
  imports: [TypeOrmModule.forFeature([DataGroups])],
  controllers: [DataGroupsController],
  providers: [DataGroupsService]
})
export class DataGroupsModule {}
