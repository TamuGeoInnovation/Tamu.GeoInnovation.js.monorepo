import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';

import { AdminGuard } from '../../guards/admin/admin.guard';
import { UserRoleService } from '../../services/user-role/user-role.service';

@Controller('user-role')
@UseGuards(AdminGuard)
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Get(':guid')
  public get(@Param('guid') guid) {
    return this.userRoleService.getRole(guid);
  }

  @Get()
  public getAll() {
    return this.userRoleService.getAll();
  }

  @Post()
  public postUserRole(@Body() body) {
    return this.userRoleService.insertUserRole(body);
  }

  @Delete(':guid')
  public async delete(@Param('guid') guid) {
    return this.userRoleService.delete(guid);
  }
}
