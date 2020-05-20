import { Test, TestingModule } from '@nestjs/testing';
import { ScenariosService } from './scenarios.service';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scenario } from '@tamu-gisc/cpa/common/entities';
describe('ScenariosService', () => {
  let service: ScenariosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScenariosService,
        { provide: getRepositoryToken(Scenario), useClass: Repository }  
      ],
    }).compile();

    service = module.get<ScenariosService>(ScenariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
