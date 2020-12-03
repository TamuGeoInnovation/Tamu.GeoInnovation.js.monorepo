import { Controller, Post, Get, Body, Param, Delete, Patch } from '@nestjs/common';

import { Role } from '../../entities/all.entity';
import { RoleService } from '../../services/role/role.service';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  public async roleGet() {
    return this.roleService.getAllRoles();
  }

  @Get(':roleGuid')
  public async specificRoleGet(@Param() params) {
    return this.roleService.getRole(params.roleGuid);
  }

  @Post()
  public async newRolePost(@Body() body) {
    const { level, name } = body;

    return this.roleService.insertRole(level, name);
  }

  @Post('all')
  public async newRolesPost(@Body() body) {
    const _roles: Partial<Role>[] = [];

    body.roles.map((role) => {
      const newRole: Partial<Role> = {
        level: role.level,
        name: role.name
      };
      _roles.push(newRole);
    });

    return this.roleService.insertRoles(_roles);
  }

  @Delete('delete/:roleGuid')
  public async deleteRolePost(@Param() params) {
    return this.roleService.deleteRole(params.roleGuid);
  }

  @Patch('update')
  public async updateRolePost(@Body() body) {
    const role: Partial<Role> = {
      ...body
    };

    return this.roleService.updateRole(role);
  }
}
