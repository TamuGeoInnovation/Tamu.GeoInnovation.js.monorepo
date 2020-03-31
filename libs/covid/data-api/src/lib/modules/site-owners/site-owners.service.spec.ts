import { Test, TestingModule } from '@nestjs/testing';
import { SiteOwnersService } from './site-owners.service';

describe('SiteOwnersService', () => {
  let service: SiteOwnersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SiteOwnersService],
    }).compile();

    service = module.get<SiteOwnersService>(SiteOwnersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
