import { Body, Controller, Get, Post } from '@nestjs/common';

import { UserRoleService } from '../../services/user-role/user-role.service';

@Controller('user-role')
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  // TODO: DON'T FORGET TO REMOVE ME - Aaron H (5/11/22)
  @Get('test')
  public getOne() {
    return this.userRoleService.getRoles('eeb5f6b3-417b-4328-a447-41eafadf991f');
  }

  @Get()
  public getAll() {
    return this.userRoleService.getAll();
  }

  @Post()
  public postUserRole(@Body() body) {
    return this.userRoleService.insertUserRole(body);
  }
}
