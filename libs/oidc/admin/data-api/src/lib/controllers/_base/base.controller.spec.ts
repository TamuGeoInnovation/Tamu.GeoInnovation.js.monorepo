import { Controller, Type } from '@nestjs/common/interfaces';
import { Test, TestingModule } from '@nestjs/testing';

import { BaseController } from './base.controller';

describe('BaseController', <T>() => {
  let controller: BaseController<T>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BaseController as Type<Controller>]
    }).compile();

    controller = module.get<BaseController<T>>(BaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
