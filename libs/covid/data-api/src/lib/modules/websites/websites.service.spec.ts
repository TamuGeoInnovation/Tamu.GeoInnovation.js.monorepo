import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { County, CountyClaim, CategoryValue, CountyClaimInfo } from '@tamu-gisc/covid/common/entities';

import { WebsitesService } from './websites.service';

describe('WebsitesService', () => {
  let service: WebsitesService;
  let CategoryValueMockRepo: MockType<Repository<CategoryValue>>;
  let CountyMockRepo: MockType<Repository<County>>;
  let CountyClaimMockRepo: MockType<Repository<CountyClaim>>;
  let CountyClaimInfoMockRepo: MockType<Repository<CountyClaimInfo>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebsitesService,
        { provide: getRepositoryToken(CategoryValue), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(County), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(CountyClaim), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(CountyClaimInfo), useFactory: repositoryMockFactory }
      ]
    }).compile();

    service = module.get<WebsitesService>(WebsitesService);
    CategoryValueMockRepo = module.get(getRepositoryToken(CategoryValue));
    CountyMockRepo = module.get(getRepositoryToken(County));
    CountyClaimMockRepo = module.get(getRepositoryToken(CountyClaim));
    CountyClaimInfoMockRepo = module.get(getRepositoryToken(CountyClaimInfo));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should be defined', () => {
    expect(service.getWebsitesForCounty(undefined)).toMatchObject({
      __zone_symbol__state: true,
      __zone_symbol__value: { message: 'Invalid county fips', status: 400, success: false }
    });
  });
});

// @ts-ignore
export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  save: jest.fn()
}));
export type MockType<T> = {
  [P in keyof T]: jest.Mock<{}>;
};
