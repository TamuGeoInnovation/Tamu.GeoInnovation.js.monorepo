import { Controller, Post, Req, Res, Get, Param, Patch, Delete } from '@nestjs/common';
import { Response } from 'express';
import { RoleService } from '../../services/role/role.service';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async roleGet() {
    return this.roleService.getAllRoles();
  }

  @Get(':roleGuid')
  async specificRoleGet(@Param() params) {
    return this.roleService.getRole(params.roleGuid);
  }

  @Post()
  async newRolePost(@Req() req, @Res() res: Response) {
    return this.roleService.insertRole(req);
  }

  @Post('all')
  async newRolesPost(@Req() req) {
    return this.roleService.insertRoles(req);
  }

  @Delete('delete/:roleGuid')
  async deleteRolePost(@Param() params) {
    return this.roleService.deleteRole(params.roleGuid);
  }

  @Patch('update')
  async updateRolePost(@Req() req) {
    return this.roleService.updateRole(req);
  }
}
