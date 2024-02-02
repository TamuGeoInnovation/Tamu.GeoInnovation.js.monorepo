import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserInfoController } from './user-info.controller';
import { Organization, University, UserInfo } from '../entities/all.entity';
import { UserInfoProvider } from './user-info.provider';

@Module({
  imports: [TypeOrmModule.forFeature([UserInfo, University, Organization])],
  providers: [UserInfoProvider],
  controllers: [UserInfoController],
  exports: []
})
export class UserInfoModule {}
