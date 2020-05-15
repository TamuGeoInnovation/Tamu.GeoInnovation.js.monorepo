import { Test, TestingModule } from '@nestjs/testing';
import { DirectoryService } from './directory.service';

describe('DirectoryService', () => {
  let service: DirectoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DirectoryService],
    }).compile();

    service = module.get<DirectoryService>(DirectoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
