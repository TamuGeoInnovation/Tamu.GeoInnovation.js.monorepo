import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { ClassProvider } from './class.provider';
import { Class } from '../entities/all.entity';

@Controller('classes')
export class ClassController {
  constructor(private readonly provider: ClassProvider) {}

  @Permissions(['read:classes'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get(':guid/attendance/export')
  public async exportAttendance(@Param('guid') guid) {
    return this.provider.getSimplifiedAttendance(guid);
  }

  @Permissions(['read:classes'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get(':guid/attendance')
  public async getAttendanceForClass(@Param('guid') guid) {
    return this.provider.getClassStudents(guid);
  }

  @Get(':guid')
  public async getClass(@Param('guid') guid) {
    return this.provider.findOne({
      where: {
        guid: guid
      }
    });
  }

  @Get()
  public async getClasses() {
    return this.provider.find();
  }

  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions(['create:classes'])
  @Post()
  public async insertClass(@Body() body: Class) {
    return this.provider.createClass(body);
  }

  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions(['update:classes'])
  @Patch(':guid')
  public async updateEntity(@Param('guid') guid, @Body() body: DeepPartial<Class>) {
    return this.provider.update(guid, body);
  }

  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions(['delete:classes'])
  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    this.provider.deleteEntity({
      where: {
        guid: guid
      }
    });
  }
}
