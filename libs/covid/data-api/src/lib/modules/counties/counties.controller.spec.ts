import { Test, TestingModule } from '@nestjs/testing';
import { CountiesController } from './counties.controller';

describe('Counties Controller', () => {
  let controller: CountiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountiesController],
    }).compile();

    controller = module.get<CountiesController>(CountiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
