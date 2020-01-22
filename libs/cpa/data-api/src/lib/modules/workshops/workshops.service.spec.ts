import { Test, TestingModule } from '@nestjs/testing';
import { WorkshopsService } from './workshops.service';

describe('WorkshopsService', () => {
  let service: WorkshopsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkshopsService],
    }).compile();

    service = module.get<WorkshopsService>(WorkshopsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
