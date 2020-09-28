import { Module } from '@nestjs/common';

import { UserProvider } from '../../providers/user/user.provider';
import { UserController } from '../../controllers/user/user.controller';

@Module({
  imports: [],
  providers: [UserProvider],
  controllers: [UserController],
  exports: []
})
export class UserModule {}
