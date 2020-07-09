import { Test, TestingModule } from '@nestjs/testing';

import { BaseEntity, Repository } from 'typeorm';

import { BaseController } from './base.controller';
import { BaseService } from './base.service';

jest.mock('./base.service');

describe('Base Controller', () => {
  let baseService: BaseService<BaseEntity>;
  let baseController: BaseController<BaseEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BaseService, Repository],
      controllers: [BaseController]
    }).compile();
    baseService = module.get<BaseService<BaseEntity>>(BaseService);
    baseController = module.get<BaseController<BaseEntity>>(BaseController);
  });

  const mockParameters = new BaseEntity();

  describe('Validation ', () => {
    it('controller should be defined', () => {
      expect(baseController).toBeDefined();
    });
  });
  describe('getAll', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(baseService, 'getAll').mockResolvedValue(expectedResult);
      expect(await baseController.getAll()).toEqual(expectedResult);
    });
  });
  describe('getOne', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new BaseEntity();
      jest.spyOn(baseService, 'getOne').mockResolvedValue(expectedResult);
      expect(await baseController.getOne(mockParameters)).toMatchObject(expectedResult);
    });
  });
  describe('insert', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new BaseEntity();
      jest.spyOn(baseService, 'createOne').mockResolvedValue(expectedResult);
      expect(await baseController.insert(mockParameters)).toMatchObject(expectedResult);
    });
  });
});
