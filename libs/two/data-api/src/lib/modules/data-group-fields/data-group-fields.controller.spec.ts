import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DataGroupFlds } from '@tamu-gisc/two/common';

import { DataGroupFieldsController } from './data-group-fields.controller';
import { DataGroupFieldsService } from './data-group-fields.service';

describe('Fields Controller', () => {
  let controller: DataGroupFieldsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataGroupFieldsService,
        {
          provide: getRepositoryToken(DataGroupFlds),
          useClass: Repository
        }
      ],
      controllers: [DataGroupFieldsController]
    }).compile();

    controller = module.get<DataGroupFieldsController>(DataGroupFieldsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
