import { Test, TestingModule } from '@nestjs/testing';
import { SitesController } from './sites.controller';

describe('Sites Controller', () => {
  let controller: SitesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SitesController],
    }).compile();

    controller = module.get<SitesController>(SitesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
