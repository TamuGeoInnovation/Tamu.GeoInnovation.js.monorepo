import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NodeGroups } from '@tamu-gisc/two/common';

import { NodeGroupsController } from './node-groups.controller';
import { NodeGroupsService } from './node-groups.service';

@Module({
  imports: [TypeOrmModule.forFeature([NodeGroups])],
  controllers: [NodeGroupsController],
  providers: [NodeGroupsService]
})
export class NodeGroupsModule {}
