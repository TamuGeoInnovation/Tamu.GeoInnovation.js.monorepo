import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CountyClaim, User, County, CountyClaimInfo, EntityToValue, EntityStatus } from '@tamu-gisc/covid/common/entities';

import { CountyClaimsService } from './county-claims.service';

describe('CountyClaimsService', () => {
  let service: CountyClaimsService;
  let UserRepoMock: MockType<Repository<User>>;
  let CountyRepoMock: MockType<Repository<County>>;
  let CountyClaimRepoMock: MockType<Repository<CountyClaim>>;
  let CountyClaimInfoRepoMock: MockType<Repository<CountyClaimInfo>>;
  let EntityStatusRepoMock: MockType<Repository<EntityStatus>>;
  let EntityToValueRepoMock: MockType<Repository<EntityToValue>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountyClaimsService,
        { provide: getRepositoryToken(CountyClaim), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(User), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(County), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(CountyClaimInfo), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(EntityToValue), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(EntityStatus), useFactory: repositoryMockFactory }
      ]
    }).compile();
    service = module.get<CountyClaimsService>(CountyClaimsService);
    UserRepoMock = module.get(getRepositoryToken(User));
    CountyRepoMock = module.get(getRepositoryToken(County));
    CountyClaimRepoMock = module.get(getRepositoryToken(CountyClaim));
    CountyClaimInfoRepoMock = module.get(getRepositoryToken(CountyClaimInfo));
    EntityStatusRepoMock = module.get(getRepositoryToken(EntityStatus));
    EntityToValueRepoMock = module.get(getRepositoryToken(EntityToValue));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /*it('should be defined', () => {
    expect(service.closeClaim(null)).toReturnWith({
      status: 400,
      success: false,
      message: 'Input parameter missing.'
    });
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
