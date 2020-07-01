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

  describe('getAll', () => {
    it('should return expected Result', async () => {
      jest.spyOn(service, 'getAll').mockResolvedValue([]);
      expect(await controller.getAll()).toEqual([]);
    });
  });

  describe('getOne', () => {
    it('should return expected Result', async () => {
      const expected = new BaseEntity();
      jest.spyOn(service, 'getOne').mockResolvedValue(expected);
      expect(await controller.getOne(expected)).toMatchObject(expected);
    });
  });

  describe('insert', () => {
    const expected = new BaseEntity();

    it('should return expected Result', async () => {
      jest.spyOn(service, 'createOne').mockResolvedValue(expected);
      expect(await controller.insert(expected)).toMatchObject(expected);
    });
    it('should return expected Result', async () => {
      jest.spyOn(service, 'createOne').mockResolvedValue(undefined);
      expect(await controller.insert(undefined)).toBeUndefined();
    });
  });

  describe('update', () => {
    const expected = new BaseEntity();

    it('should return expected Result', async () => {
      jest.spyOn(service, 'updateOne').mockResolvedValue(expected);
      expect(await controller.update(expected, expected)).toMatchObject(expected);
    });
    it('should return expected Result', async () => {
      jest.spyOn(service, 'updateOne').mockResolvedValue(undefined);
      expect(controller.update).toThrowError();
    });
  });

  describe('delete', () => {
    const expected = new BaseEntity();

    it('should return expected Result', async () => {
      jest.spyOn(service, 'deleteOne').mockResolvedValue(expected);
      expect(await controller.delete(expected)).toMatchObject(expected);
    });
    it('should return expected Result', async () => {
      jest.spyOn(service, 'deleteOne').mockResolvedValue(undefined);
      expect(controller.delete).toThrowError();
    });
  });
});
