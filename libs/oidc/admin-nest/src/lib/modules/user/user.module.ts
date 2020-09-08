import { Module, NestModule, HttpModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '../../controllers/user/user.controller';
import { SecretQuestionController } from '../../controllers/secret-question/secret-question.controller';
import { UserService } from '../../services/user/user.service';

import {
  AccountRepo,
  UserRepo,
  RoleRepo,
  ClientMetadataRepo,
  UserRoleRepo,
  SecretQuestionRepo,
  SecretAnswerRepo,
  UserPasswordResetRepo,
  UserPasswordHistoryRepo
} from '../../entities/all.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountRepo,
      UserRepo,
      RoleRepo,
      ClientMetadataRepo,
      SecretQuestionRepo,
      SecretAnswerRepo,
      UserRoleRepo,
      UserPasswordResetRepo,
      UserPasswordHistoryRepo
    ]),
    HttpModule
  ],
  controllers: [UserController, SecretQuestionController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
