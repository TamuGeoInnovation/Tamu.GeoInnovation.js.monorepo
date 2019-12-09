import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DataGroupFlds } from '@tamu-gisc/two/common';

import { DataGroupFieldsService } from './data-group-fields.service';

describe('FieldsService', () => {
  let service: DataGroupFieldsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataGroupFieldsService,
        {
          provide: getRepositoryToken(DataGroupFlds),
          useClass: Repository
        }
      ]
    }).compile();

    service = module.get<DataGroupFieldsService>(DataGroupFieldsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
