import { Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { University } from '../../entities/all.entity';
import { UniversityProvider } from '../../providers/university/university.provider';
import { BaseController } from '../../controllers/_base/base.controller';

@Controller('university')
export class UniversityController extends BaseController<University> {
  constructor(private readonly universityProvider: UniversityProvider) {
    super(universityProvider);
  }
}
