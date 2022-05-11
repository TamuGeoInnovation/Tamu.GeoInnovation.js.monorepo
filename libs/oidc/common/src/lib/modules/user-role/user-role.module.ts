import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserRoleController } from '../../controllers/user-role/user-role.controller';
import { NewUserRole, NewUserRoleRepo } from '../../oidc-common';
import { UserRoleService } from '../../services/user-role/user-role.service';

@Module({
  imports: [TypeOrmModule.forFeature([NewUserRoleRepo])],
  controllers: [UserRoleController],
  providers: [UserRoleService],
  exports: []
})
export class UserRoleModule {}

