import { Test, TestingModule } from '@nestjs/testing';
import { StatusService } from './status.service';

describe('DashboardService', () => {
  let service: StatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusService],
    }).compile();

    service = module.get<StatusService>(StatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
