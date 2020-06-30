import { Test, TestingModule } from '@nestjs/testing';

import { StatesController } from './states.controller';
import { StatesService } from './states.service';
import { State } from '@tamu-gisc/covid/common/entities';

jest.mock('./states.service');

describe('States Controller', () => {
  let stateService: StatesService;
  let module: TestingModule;
  let controller: StatesController;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [StatesService],
      controllers: [StatesController]
    }).compile();
    stateService = module.get<StatesService>(StatesService);
    controller = module.get<StatesController>(StatesController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('searchState', () => {
    it('should return expected Result', async () => {
      const expectedValue = [];
      jest.spyOn(stateService, 'search').mockResolvedValue(expectedValue);
      expect(await controller.searchState('yeet')).toBe(expectedValue);
    });
  });

  describe('getState', () => {
    it('should return expected Result', async () => {
      const expectedValue = new State();
      expectedValue.stateFips = 0;
      jest.spyOn(stateService, 'getStateByFips').mockResolvedValue(expectedValue);
      expect(await controller.getState(0)).toEqual(expectedValue);
    });
  });

  describe('insertState', () => {
    it('should return expected Result', async () => {
      expect(await controller.insertState()).toEqual('Not implemented.');
    });
  });

  describe('updateState', () => {
    it('should return expected Result', async () => {
      expect(await controller.updateState()).toEqual('Not implemented.');
    });
  });
  describe('deleteState', () => {
    it('should return expected Result', async () => {
      expect(await controller.deleteState()).toEqual('Not implemented.');
    });
  });
});
