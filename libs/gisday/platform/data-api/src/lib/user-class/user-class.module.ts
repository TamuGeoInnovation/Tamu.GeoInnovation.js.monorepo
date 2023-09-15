import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserClassController } from './user-class.controller';
import { UserClassProvider } from './user-class.provider';
import { Class, UserClass } from '../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserClass, Class])],
  controllers: [UserClassController],
  providers: [UserClassProvider]
})
export class UserClassModule {}
