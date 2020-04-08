import { Test, TestingModule } from '@nestjs/testing';
import { WebsiteTypesService } from './website-types.service';

describe('WebsiteTypesService', () => {
  let service: WebsiteTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebsiteTypesService]
    }).compile();

    service = module.get<WebsiteTypesService>(WebsiteTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
