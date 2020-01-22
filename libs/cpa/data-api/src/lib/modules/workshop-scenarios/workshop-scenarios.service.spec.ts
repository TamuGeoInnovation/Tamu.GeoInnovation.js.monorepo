import { Test, TestingModule } from '@nestjs/testing';
import { WorkshopScenariosService } from './workshop-scenarios.service';

describe('WorkshopScenariosService', () => {
  let service: WorkshopScenariosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkshopScenariosService],
    }).compile();

    service = module.get<WorkshopScenariosService>(WorkshopScenariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
