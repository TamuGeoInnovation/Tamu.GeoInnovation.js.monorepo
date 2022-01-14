import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserLoginRepo } from '@tamu-gisc/oidc/common';

import { UserLoginService } from '../../services/user-login/user-login.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserLoginRepo])],
  exports: [UserLoginService],
  controllers: [],
  providers: [UserLoginService]
})
export class UserLoginModule {}
