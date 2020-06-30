import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { State } from '@tamu-gisc/covid/common/entities';

import { StatesService } from './states.service';

describe('StatesService', () => {
  let service: StatesService;
  let StateMockRepo: MockType<Repository<State>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatesService, { provide: getRepositoryToken(State), useFactory: repositoryMockFactory }]
    }).compile();
    service = module.get<StatesService>(StatesService);
    StateMockRepo = module.get(getRepositoryToken(State));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should search', () => {
    const stateName = 'yeet';
    const stateTest = new State();
    stateTest.name = stateName;
    StateMockRepo.find.mockReturnValue(stateName);
    expect(service.search('yeet')).toEqual(stateName);
  });
  it('should getStateByFips', () => {
    const stateFipsTest = 99;
    const stateTest = new State();
    stateTest.stateFips = stateFipsTest;
    StateMockRepo.findOne.mockReturnValue(stateFipsTest);
    expect(service.getStateByFips(99)).toEqual(stateFipsTest);
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
