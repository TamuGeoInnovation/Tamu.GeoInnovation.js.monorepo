import { Test, TestingModule } from '@nestjs/testing';
import { WebsiteTypesController } from './website-types.controller';

describe('WebsiteTypesController Controller', () => {
  let controller: WebsiteTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebsiteTypesController],
    }).compile();

    controller = module.get<WebsiteTypesController>(WebsiteTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
