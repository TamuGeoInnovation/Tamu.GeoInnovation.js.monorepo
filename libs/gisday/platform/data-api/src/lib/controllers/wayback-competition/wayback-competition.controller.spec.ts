import { Test, TestingModule } from '@nestjs/testing';
import { WaybackCompetitionController } from './wayback-competition.controller';

describe('WaybackCompetition Controller', () => {
  let controller: WaybackCompetitionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WaybackCompetitionController],
    }).compile();

    controller = module.get<WaybackCompetitionController>(WaybackCompetitionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
