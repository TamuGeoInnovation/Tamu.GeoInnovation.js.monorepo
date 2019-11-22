import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Fields } from '@tamu-gisc/two/common';

import { FieldsController } from './fields.controller';
import { FieldsService } from './fields.service';

describe('Fields Controller', () => {
  let controller: FieldsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldsService,
        {
          provide: getRepositoryToken(Fields),
          useClass: Repository
        }
      ],
      controllers: [FieldsController]
    }).compile();

    controller = module.get<FieldsController>(FieldsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
