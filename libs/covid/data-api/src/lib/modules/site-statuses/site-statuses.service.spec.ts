import { Test, TestingModule } from '@nestjs/testing';
import { SiteStatusesService } from './site-statuses.service';

describe('SiteStatusesService', () => {
  let service: SiteStatusesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SiteStatusesService],
    }).compile();

    service = module.get<SiteStatusesService>(SiteStatusesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
