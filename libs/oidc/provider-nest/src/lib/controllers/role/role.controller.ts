import { Controller, Post, Req, Res } from '@nestjs/common';
import { RoleService } from '../../services/role/role.service';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  async newRolePost(@Req() req) {
    return this.roleService.insertRole(req);
  }
}
