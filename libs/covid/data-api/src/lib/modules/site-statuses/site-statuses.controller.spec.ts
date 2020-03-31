import { Test, TestingModule } from '@nestjs/testing';
import { SiteStatusesController } from './site-statuses.controller';

describe('SiteStatuses Controller', () => {
  let controller: SiteStatusesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SiteStatusesController],
    }).compile();

    controller = module.get<SiteStatusesController>(SiteStatusesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
