import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserClassController } from '../../controllers/user-class/user-class.controller';
import { UserClassProvider } from '../../providers/user-class/user-class.provider';
import { UserClassRepo } from '../../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserClassRepo])],
  controllers: [UserClassController],
  providers: [UserClassProvider]
})
export class UserClassModule {}
