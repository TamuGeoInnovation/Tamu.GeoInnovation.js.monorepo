import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserInfoController } from '../../controllers/user-info/user-info.controller';
import { UserInfoRepo } from '../../entities/all.entity';
import { UserInfoProvider } from '../../providers/user-info/user-info.provider';

@Module({
  imports: [TypeOrmModule.forFeature([UserInfoRepo])],
  providers: [UserInfoProvider],
  controllers: [UserInfoController],
  exports: []
})
export class UserInfoModule {}
