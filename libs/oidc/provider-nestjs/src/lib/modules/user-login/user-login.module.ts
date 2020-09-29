import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserLoginService } from '../../services/user-login/user-login.service';
import { UserLoginRepo } from '../../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserLoginRepo])],
  exports: [UserLoginService],
  controllers: [],
  providers: [UserLoginService]
})
export class UserLoginModule {}
