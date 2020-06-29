import { Test, TestingModule } from '@nestjs/testing';
import { CountiesService } from './counties.service';

describe('CountiesService', () => {
  let service: CountiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CountiesService],
    }).compile();

    service = module.get<CountiesService>(CountiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
