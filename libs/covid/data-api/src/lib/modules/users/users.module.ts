import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User, TestingSite } from '@tamu-gisc/covid/common/entities';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, TestingSite])],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
