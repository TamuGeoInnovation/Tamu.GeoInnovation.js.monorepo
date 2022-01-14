import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserClassController } from '../../controllers/user-class/user-class.controller';
import { UserClassProvider } from '../../providers/user-class/user-class.provider';
import { ClassRepo, UserClassRepo } from '../../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserClassRepo, ClassRepo])],
  controllers: [UserClassController],
  providers: [UserClassProvider]
})
export class UserClassModule {}
