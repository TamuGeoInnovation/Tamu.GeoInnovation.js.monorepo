import { Test, TestingModule } from '@nestjs/testing';
import { StatusAPIService } from './status-api.service';

describe('DashboardService', () => {
  let service: StatusAPIService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusAPIService],
    }).compile();

    service = module.get<StatusAPIService>(StatusAPIService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
