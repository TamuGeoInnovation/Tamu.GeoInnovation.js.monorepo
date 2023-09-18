import { Body, Controller, Delete, Get, NotImplementedException, Param, Patch, Post } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { ClassProvider } from './class.provider';
import { Class } from '../entities/all.entity';

@Controller('classes')
export class ClassController {
  constructor(private readonly provider: ClassProvider) {}

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

  @Post()
  public async insertClass(@Body() body: DeepPartial<Class>) {
    return this.provider.save(body);
  }

  @Patch()
  public async updateClass(@Body() body) {
    throw new NotImplementedException();
  }

  @Delete()
  public async deleteEntity(@Body('guid') guid: string) {
    this.provider.deleteEntity({
      where: {
        guid: guid
      }
    });
  }
}
