import { Test, TestingModule } from '@nestjs/testing';

import { BaseEntity } from 'typeorm';

import { BaseController } from './base.controller';
import { BaseService } from './base.service';

jest.mock('./base.service');

describe('Base Controller', () => {
  let baseService: BaseService<BaseEntity>;
  let baseController: BaseController<BaseEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BaseService],
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
      const serviceSpy = jest.spyOn(baseService, 'getAll');
      await baseController.getAll();
      expect(serviceSpy).toHaveBeenCalled();
    });
  });

  describe('getOne', () => {
    it('should return expectedResult', async () => {
      const serviceSpy = jest.spyOn(baseService, 'getOne');
      await baseController.getOne(mockParameters);
      expect(serviceSpy).toHaveBeenCalled();
    });
  });

  describe('insert', () => {
    it('should return expectedResult', async () => {
      const serviceSpy = jest.spyOn(baseService, 'createOne');
      await baseController.insert(mockParameters);
      expect(serviceSpy).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should return expectedResult', async () => {
      const serviceSpy = jest.spyOn(baseService, 'updateOne');
      await baseController.update(mockParameters, mockParameters);
      expect(serviceSpy).toHaveBeenCalled();
    });
    it('should throw Error', async () => {
      jest.spyOn(baseService, 'updateOne').mockResolvedValue(undefined);
      expect(baseController.update).toThrowError();
    });
  });

  describe('delete', () => {
    it('should return expectedResult', async () => {
      const serviceSpy = jest.spyOn(baseService, 'deleteOne');
      await baseController.delete(mockParameters);
      expect(serviceSpy).toHaveBeenCalled();
    });
    it('should throw Error', async () => {
      jest.spyOn(baseService, 'deleteOne').mockResolvedValue(undefined);
      expect(baseController.delete).toThrowError();
    });
  });
});
