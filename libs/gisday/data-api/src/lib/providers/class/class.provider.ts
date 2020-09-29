import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Class, ClassRepo } from '../../entities/all.entity';
// import { } from '@tamu-gisc/oidc/provider';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class ClassProvider extends BaseProvider<Class> {
  constructor(private readonly classRepo: ClassRepo) {
    super(classRepo);
  }

  async insertClass(req: Request) {
    // const profGuid = req.body.professorUserGuid;
  }
}
