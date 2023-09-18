import { Test, TestingModule } from '@nestjs/testing';
import { SeasonDayController } from './season-day.controller';
import { SeasonDayService } from './season-day.service';

describe('SeasonDayController', () => {
  let controller: SeasonDayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeasonDayController],
      providers: [SeasonDayService]
    }).compile();

    controller = module.get<SeasonDayController>(SeasonDayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
