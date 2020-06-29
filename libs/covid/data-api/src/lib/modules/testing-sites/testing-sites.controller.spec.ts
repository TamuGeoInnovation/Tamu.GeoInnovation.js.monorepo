import { Test, TestingModule } from '@nestjs/testing';
import { TestingSitesController } from './testing-sites.controller';

describe('TestingSitesController', () => {
  let controller: TestingSitesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestingSitesController]
    }).compile();

    controller = module.get<TestingSitesController>(TestingSitesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
