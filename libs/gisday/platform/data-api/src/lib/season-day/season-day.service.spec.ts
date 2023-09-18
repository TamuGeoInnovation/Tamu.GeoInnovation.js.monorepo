import { Test, TestingModule } from '@nestjs/testing';
import { SeasonDayService } from './season-day.service';

describe('SeasonDayService', () => {
  let service: SeasonDayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeasonDayService]
    }).compile();

    service = module.get<SeasonDayService>(SeasonDayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
