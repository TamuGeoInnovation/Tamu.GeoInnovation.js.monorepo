import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { County, CountyClaim } from '@tamu-gisc/covid/common/entities';

import { CountiesService } from './counties.service';

describe('CountiesService', () => {
  let service: CountiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountiesService,
        { provide: getRepositoryToken(County), useClass: Repository },
        { provide: getRepositoryToken(CountyClaim), useClass: Repository }
      ]
    }).compile();

    service = module.get<CountiesService>(CountiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
