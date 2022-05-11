import { Controller, Get } from '@nestjs/common';

import { UserRoleService } from '../../services/user-role/user-role.service';

@Controller('user-role')
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Get()
  public getAll() {
    return this.userRoleService.getAll();
  }
}

