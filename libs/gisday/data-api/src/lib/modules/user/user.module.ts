import { Module } from '@nestjs/common';

import { UserController } from '../../controllers/user/user.controller';

@Module({
  imports: [],
  providers: [],
  controllers: [UserController],
  exports: []
})
export class UserModule {}
