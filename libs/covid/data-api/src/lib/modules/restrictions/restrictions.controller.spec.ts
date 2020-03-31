import { Test, TestingModule } from '@nestjs/testing';
import { RestrictionsController } from './restrictions.controller';

describe('Restrictions Controller', () => {
  let controller: RestrictionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestrictionsController],
    }).compile();

    controller = module.get<RestrictionsController>(RestrictionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
