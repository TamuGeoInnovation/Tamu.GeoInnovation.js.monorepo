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
    it('should call service method getAll', async () => {
      const serviceSpy = jest.spyOn(baseService, 'getAll');
      baseController.getAll();
      expect(serviceSpy).toHaveBeenCalled();
    });
  });

  describe('getOne', () => {
    it('should call service method getOne', async () => {
      const serviceSpy = jest.spyOn(baseService, 'getOne');
      baseController.getOne(mockParameters);
      expect(serviceSpy).toHaveBeenCalled();
    });
  });

  describe('insert', () => {
    it('should call service method createOne', async () => {
      const serviceSpy = jest.spyOn(baseService, 'createOne');
      baseController.insert(mockParameters);
      expect(serviceSpy).toHaveBeenCalled();
    });
  });
});
