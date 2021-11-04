import { Test, TestingModule } from '@nestjs/testing';
import { StatusChangesService } from './status-changes.service';

describe('StatusChangesService', () => {
  let service: StatusChangesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusChangesService],
    }).compile();

    service = module.get<StatusChangesService>(StatusChangesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
