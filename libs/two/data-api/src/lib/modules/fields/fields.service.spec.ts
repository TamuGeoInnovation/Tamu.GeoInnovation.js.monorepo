import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Fields } from '@tamu-gisc/two/common';

import { FieldsService } from './fields.service';

describe('FieldsService', () => {
  let service: FieldsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldsService,
        {
          provide: getRepositoryToken(Fields),
          useClass: Repository
        }
      ]
    }).compile();

    service = module.get<FieldsService>(FieldsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
