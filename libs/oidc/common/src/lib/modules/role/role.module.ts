import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoleService } from '../../services/role/role.service';
import { RoleController } from '../../controllers/role/role.controller';
import { RoleRepo } from '../../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleRepo])],
  providers: [RoleService],
  controllers: [RoleController],
  exports: [RoleService]
})
export class RoleModule {}
