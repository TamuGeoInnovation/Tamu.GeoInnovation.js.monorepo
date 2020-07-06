import { Test, TestingModule } from '@nestjs/testing';

import { BaseEntity } from 'typeorm';

import { BaseController } from './base.controller';
import { BaseService } from './base.service';

jest.mock('./base.service');

describe('Base Controller', () => {
  let controller: BaseController<BaseEntity>;
  let service: BaseService<BaseEntity>;
  let module: TestingModule;
  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [BaseService],
      controllers: [BaseController]
    }).compile();
    service = module.get<BaseService<BaseEntity>>(BaseService);
    controller = module.get<BaseController<BaseEntity>>(BaseController);
  });

  const mockParameters = new BaseEntity();
  describe('Validation ', () => {
    it('controller should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('getAll', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getAll').mockResolvedValue(expectedResult);
      expect(await controller.getAll()).toEqual(expectedResult);
    });
  });

  describe('getOne', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new BaseEntity();
      jest.spyOn(service, 'getOne').mockResolvedValue(expectedResult);
      expect(await controller.getOne(mockParameters)).toMatchObject(expectedResult);
    });
  });

  describe('insert', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new BaseEntity();
      jest.spyOn(service, 'createOne').mockResolvedValue(expectedResult);
      expect(await controller.insert(mockParameters)).toMatchObject(expectedResult);
    });
    it('should return toBeUndefined', async () => {
      jest.spyOn(service, 'createOne').mockResolvedValue(undefined);
      expect(await controller.insert(undefined)).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new BaseEntity();
      jest.spyOn(service, 'updateOne').mockResolvedValue(expectedResult);
      expect(await controller.update(mockParameters, mockParameters)).toMatchObject(expectedResult);
    });
    it('should throw Error', async () => {
      jest.spyOn(service, 'updateOne').mockResolvedValue(undefined);
      expect(controller.update).toThrowError();
    });
  });

  describe('delete', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new BaseEntity();
      jest.spyOn(service, 'deleteOne').mockResolvedValue(expectedResult);
      expect(await controller.delete(mockParameters)).toMatchObject(expectedResult);
    });
    it('should throw Error', async () => {
      jest.spyOn(service, 'deleteOne').mockResolvedValue(undefined);
      expect(controller.delete).toThrowError();
    });
  });
});
