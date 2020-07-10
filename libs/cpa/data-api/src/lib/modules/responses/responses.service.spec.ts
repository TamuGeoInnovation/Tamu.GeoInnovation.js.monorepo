import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Response } from '@tamu-gisc/cpa/common/entities';

import { ResponsesService } from './responses.service';

describe('ResponsesService', () => {
  let service: ResponsesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponsesService, { provide: getRepositoryToken(Response), useClass: Repository }]
    }).compile();

    service = module.get<ResponsesService>(ResponsesService);
  });

  describe('Validation ', () => {
    it('service should be defined', async () => {
      expect(service).toBeDefined();
    });
  });
});
