import { Controller } from '@nestjs/common';
import { User } from '@tamu-gisc/covid/common/entities';

import { UsersService } from './users.service';
import { BaseController } from '../base/base.controller';

@Controller('users')
export class UsersController extends BaseController<User> {
  constructor(private service: UsersService) {
    super(service);
  }
}
