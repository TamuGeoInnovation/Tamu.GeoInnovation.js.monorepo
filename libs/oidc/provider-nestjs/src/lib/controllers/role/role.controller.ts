import { Controller, Post, Req, Get } from '@nestjs/common';

import { RoleService } from '../../services/role/role.service';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  public async roleGet() {
    return this.roleService.getAllRoles();
  }

  @Post()
  public async newRolePost(@Req() req) {
    return this.roleService.insertRole(req);
  }

  @Post('all')
  public async newRolesPost(@Req() req) {
    return this.roleService.insertRoles(req);
  }
}
