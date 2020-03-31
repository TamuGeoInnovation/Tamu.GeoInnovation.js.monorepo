import { Test, TestingModule } from '@nestjs/testing';
import { SiteServicesService } from './site-services.service';

describe('SiteServicesService', () => {
  let service: SiteServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SiteServicesService],
    }).compile();

    service = module.get<SiteServicesService>(SiteServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
