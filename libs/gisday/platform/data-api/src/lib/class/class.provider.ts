import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Class } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class ClassProvider extends BaseProvider<Class> {
  constructor(@InjectRepository(Class) private classRepo: Repository<Class>) {
    super(classRepo);
  }

  public createClass(dto: Class) {
    const existing = this.classRepo.findOne({
      where: {
        code: dto.code,
        professorName: dto.professorName
      }
    });

    if (!existing) {
      delete dto.guid;
      return this.classRepo.create(dto);
    } else {
      return existing;
    }
  }
}
