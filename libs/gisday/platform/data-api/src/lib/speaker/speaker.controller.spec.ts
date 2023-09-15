import { Test, TestingModule } from '@nestjs/testing';
import { SpeakerController } from './speaker.controller';

describe('Speaker Controller', () => {
  let controller: SpeakerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpeakerController]
    }).compile();

    controller = module.get<SpeakerController>(SpeakerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
