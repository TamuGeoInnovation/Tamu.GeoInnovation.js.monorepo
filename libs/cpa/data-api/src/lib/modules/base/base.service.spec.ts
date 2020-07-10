import { Test, TestingModule } from '@nestjs/testing';
import { BaseEntity, Repository } from 'typeorm';

import { BaseService } from './base.service';

jest.mock('typeorm');

describe('BaseService', () => {
  let service: BaseService<BaseEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BaseService, Repository]
    }).compile();

    service = module.get<BaseService<BaseEntity>>(BaseService);
  });

  describe('Validation ', () => {
    it('service should be defined', async () => {
      expect(service).toBeDefined();
    });
  });
  describe('getAll ', () => {
    it('should call repoSpy', async () => {
      const repoSpy = jest.spyOn(service.repository, 'find');
      service.getAll();
      expect(repoSpy).toHaveBeenCalled();
    });
  });
  describe('getOne ', () => {
    it('should call repoSpy', () => {
      const mockedParamater = {};
      const repoSpy = jest.spyOn(service.repository, 'findOne');
      service.getOne(mockedParamater);
      expect(repoSpy).toHaveBeenCalled();
    });
  });
  describe('getMany ', () => {
    it('should call repoSpy', () => {
      const mockedParamater = {};
      const repoSpy = jest.spyOn(service.repository, 'find');
      service.getMany(mockedParamater);
      expect(repoSpy).toHaveBeenCalled();
    });
  });
  describe('createOne ', () => {
    it('should call repoSpy', () => {
      const mockedParamater = {};
      const repoSpy = jest.spyOn(service.repository, 'create').mockReturnValue(new BaseEntity());
      service.createOne(mockedParamater);
      expect(repoSpy).toHaveBeenCalled();
    });
  });
});
