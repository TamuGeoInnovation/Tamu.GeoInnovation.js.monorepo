import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { University } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class UniversityProvider extends BaseProvider<University> {
  constructor(@InjectRepository(University) private universityRepo: Repository<University>) {
    super(universityRepo);
  }
}
