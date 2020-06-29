import { Test, TestingModule } from '@nestjs/testing';
import { TestingSitesService } from './testing-sites.service';

describe('TestingSitesService', () => {
  let service: TestingSitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestingSitesService],
    }).compile();

    service = module.get<TestingSitesService>(TestingSitesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
