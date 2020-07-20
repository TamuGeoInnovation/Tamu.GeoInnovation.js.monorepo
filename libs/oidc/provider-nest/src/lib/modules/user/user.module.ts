import { Module, NestModule, HttpModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '../../controllers/user/user.controller';
import { SecretQuestionController } from '../../controllers/secret-question/secret-question.controller';
import { UserService } from '../../services/user/user.service';
import { StaticAccountService } from '../../services/account/account.service';
import {
  UserValidationMiddleware,
  PasswordValidationMiddleware
} from '../../middleware/user-validation/user-validation.middleware';
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
  providers: [UserService, StaticAccountService],
  exports: [UserService, StaticAccountService]
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserValidationMiddleware).forRoutes({
      path: 'user/register',
      method: RequestMethod.POST
    });
    consumer.apply(PasswordValidationMiddleware).forRoutes({
      path: 'user/npw/:token',
      method: RequestMethod.POST
    });
  }
}
