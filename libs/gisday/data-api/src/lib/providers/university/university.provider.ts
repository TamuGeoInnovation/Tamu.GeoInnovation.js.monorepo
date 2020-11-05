import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { University, UniversityRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';

@Injectable()
export class UniversityProvider extends BaseProvider<University> {
  constructor(private readonly universityRepo: UniversityRepo) {
    super(universityRepo);
  }
}
