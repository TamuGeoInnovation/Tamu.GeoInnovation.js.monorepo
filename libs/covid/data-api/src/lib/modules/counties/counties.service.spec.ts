import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { County, CountyClaim } from '@tamu-gisc/covid/common/entities';

import { CountiesService } from './counties.service';

describe('CountiesService', () => {
  let countiesService: CountiesService;
  let countyMockRepo: Repository<County>;
  let countyClaimMockRepo: Repository<CountyClaim>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountiesService,
        { provide: getRepositoryToken(County), useClass: Repository },
        { provide: getRepositoryToken(CountyClaim), useClass: Repository }
      ]
    }).compile();

    countiesService = module.get<CountiesService>(CountiesService);
    countyMockRepo = module.get(getRepositoryToken(County));
    countyClaimMockRepo = module.get(getRepositoryToken(CountyClaim));
  });

  describe('Validation ', () => {
    it('service should be defined', () => {
      expect(countiesService).toBeDefined();
    });
  });

  describe('getCountiesForState', () => {
    it('should throw error for undefined parameter ', async () => {
      const mockParameter = undefined;
      expect(() => countiesService.getCountiesForState(mockParameter)).toThrow();
    });

    it('should throw error for undefined string parameter ', async () => {
      const mockParameter = 'undefined';
      expect(() => countiesService.getCountiesForState(mockParameter)).toThrow();
    });

    it('should throw error for null  parameter ', async () => {
      const mockParameter = null;
      expect(() => countiesService.getCountiesForState(mockParameter)).toThrow();
    });

    it('should throw error for null string parameter ', async () => {
      const mockParameter = 'null';
      expect(() => countiesService.getCountiesForState(mockParameter)).toThrow();
    });
  });
});
