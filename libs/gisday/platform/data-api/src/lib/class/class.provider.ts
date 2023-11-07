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

  public async createClass(dto: Class) {
    const existing = await this.classRepo.findOne({
      where: {
        code: dto.code,
        number: dto.number,
        professorName: dto.professorName
      }
    });

    if (!existing) {
      delete dto.guid;
      const created = this.classRepo.create(dto);

      return created.save();
    } else {
      return existing;
    }
  }
}
