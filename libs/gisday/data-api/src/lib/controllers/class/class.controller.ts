import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedGuard } from '@tamu-gisc/oidc/client';
import { Class } from '../../entities/all.entity';
import { ClassProvider } from '../../providers/class/class.provider';
import { BaseController } from '../../controllers/_base/base.controller';

@Controller('class')
export class ClassController extends BaseController<Class> {
  constructor(private readonly classProvider: ClassProvider) {
    super(classProvider);
  }

  // @UseGuards(AuthenticatedGuard)
  // @Post('/')
  // async insertClass(@Req() req: Request) {
  //   // return this.classProvider.
  // }
}
