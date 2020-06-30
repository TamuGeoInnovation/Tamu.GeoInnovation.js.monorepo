import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { County, CountyClaim } from '@tamu-gisc/covid/common/entities';

import { CountiesService } from './counties.service';

describe('CountiesService', () => {
  let service: CountiesService;
  let CountyMockRepo: MockType<Repository<County>>;
  let CountyClaimMockRepo: MockType<Repository<CountyClaim>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountiesService,
        { provide: getRepositoryToken(County), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(CountyClaim), useFactory: repositoryMockFactory }
      ]
    }).compile();

    service = module.get<CountiesService>(CountiesService);
    CountyMockRepo = module.get(getRepositoryToken(County));
    CountyClaimMockRepo = module.get(getRepositoryToken(CountyClaim));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should properly Search', () => {
    const countyName = 'reee';
    const countyTest = new County();
    countyTest.name = countyName;
    CountyMockRepo.find.mockReturnValue(countyTest);
    expect(service.search('bubba')).toEqual({ name: 'reee' });
  });

  it('should properly searchCountiesForState', () => {
    const countyName = 'reee';
    const countyFips = 14;
    const countyTest = new County();
    countyTest.name = countyName;
    countyTest.countyFips = countyFips;
    CountyMockRepo.find.mockReturnValue(countyTest);
    expect(service.searchCountiesForState(14, 'reee')).toEqual({ countyFips: 14, name: 'reee' });
  });

  it('should properly getCountiesForState', () => {
    expect(() => {
      service.getCountiesForState(undefined);
    }).toThrow();
    const stateFipsMock = {
      stateFips: 6,
      name: 'yeet',
      abbreviation: 'yt',
      hasId: undefined,
      save: undefined,
      remove: undefined,
      reload: undefined
    };
    const countyTest = new County();
    countyTest.stateFips = stateFipsMock;
    CountyMockRepo.find.mockReturnValue(countyTest);
    expect(service.getCountiesForState('yeet')).toBe(countyTest);
  });

  /* Work inprogress
  it('should be getCountyStats()', () => {
    const stateFipsMock = {
      stateFips: 6,
      name: 'yeet',
      abbreviation: 'yt',
      hasId: undefined,
      save: undefined,
      remove: undefined,
      reload: undefined
    };
    const countyTest = new County();
    countyTest.stateFips = stateFipsMock;
    countyTest.name = 'yeet';
    countyTest.countyFips = 0;
    CountyMockRepo.createQueryBuilder.mockReturnValue(countyTest);
    expect(service.getCountyStats()).toBeDefined();
  });*/
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
