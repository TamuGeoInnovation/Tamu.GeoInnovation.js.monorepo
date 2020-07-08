import { Controller, Post, Req, Res, Get } from '@nestjs/common';
import { RoleService } from '../../services/role/role.service';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async roleGet() {
    return this.roleService.getAllRoles();
  }

  @Post()
  async newRolePost(@Req() req) {
    return this.roleService.insertRole(req);
  }
}
