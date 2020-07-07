import { Module } from '@nestjs/common';
import { UserController } from '../../controllers/user/user.controller';
import { UserService } from '../../services/user/user.service';
import { StaticAccountService } from '../../services/account/account.service';
import { AccountRepo, UserRepo } from '../../entities/all.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AccountRepo, UserRepo])],
  controllers: [UserController],
  providers: [UserService, StaticAccountService],
  exports: [UserService, StaticAccountService]
})
export class UserModule {}
