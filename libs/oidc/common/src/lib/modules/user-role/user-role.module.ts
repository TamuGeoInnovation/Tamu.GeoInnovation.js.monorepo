import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserRoleController } from '../../controllers/user-role/user-role.controller';
import { ClientRepo, NewUserRoleRepo, RoleRepo, UserRepo } from '../../oidc-common';
import { UserRoleService } from '../../services/user-role/user-role.service';

@Module({
  imports: [TypeOrmModule.forFeature([NewUserRoleRepo, ClientRepo, RoleRepo, UserRepo])],
  controllers: [UserRoleController],
  providers: [UserRoleService],
  exports: []
})
export class UserRoleModule {}
