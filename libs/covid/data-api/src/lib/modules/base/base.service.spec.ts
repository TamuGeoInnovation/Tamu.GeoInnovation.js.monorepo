import { Test, TestingModule } from '@nestjs/testing';

import { BaseEntity, Repository } from 'typeorm';

import { BaseService } from './base.service';

jest.mock('typeorm');

describe('BaseService', () => {
  let baseService: BaseService<BaseEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BaseService, Repository]
    }).compile();

    baseService = module.get<BaseService<BaseEntity>>(BaseService);
  });

  describe('Validation ', () => {
    it('baseService should be defined', () => {
      expect(baseService).toBeDefined();
    });
  });

  describe('createOne ', () => {
    it('should call repoSpy', async () => {
      const mockedParamater = {};
      const mockedBaseEntity = new BaseEntity();
      const repoSpy = jest.spyOn(baseService.repository, 'create').mockReturnValue(mockedBaseEntity);
      baseService.createOne(mockedParamater);
      expect(repoSpy).toHaveBeenCalled();
    });
  });

  describe('getOne ', () => {
    it('should call repoSpy', async () => {
      const mockedParamater = {};
      const repoSpy = jest.spyOn(baseService.repository, 'findOne');
      baseService.getOne(mockedParamater);
      expect(repoSpy).toHaveBeenCalled();
    });
  });

  describe('getMany ', () => {
    it('should call repoSpy', async () => {
      const mockedParamater = {};
      const repoSpy = jest.spyOn(baseService.repository, 'find');
      baseService.getMany(mockedParamater);
      expect(repoSpy).toHaveBeenCalled();
    });
  });

  describe('getAll ', () => {
    it('should call repoSpy', async () => {
      const repoSpy = jest.spyOn(baseService.repository, 'find');
      baseService.getAll();
      expect(repoSpy).toHaveBeenCalled();
    });
  });

  describe('updateOne ', () => {
    it('should call repoSpy', async () => {
      const mockedParamater = {};
      const mockedBaseEntity = new BaseEntity();
      const repoSpy = jest.spyOn(baseService.repository, 'findOne').mockReturnValue(Promise.resolve(mockedBaseEntity));
      baseService.updateOne(mockedParamater, mockedParamater);
      expect(repoSpy).toHaveBeenCalled();
    });
  });
});
