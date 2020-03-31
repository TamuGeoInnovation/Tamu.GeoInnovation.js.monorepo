import { Test, TestingModule } from '@nestjs/testing';
import { SiteServicesController } from './site-services.controller';

describe('SiteServices Controller', () => {
  let controller: SiteServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SiteServicesController],
    }).compile();

    controller = module.get<SiteServicesController>(SiteServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
