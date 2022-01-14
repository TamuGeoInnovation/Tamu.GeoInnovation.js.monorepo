import { Test, TestingModule } from '@nestjs/testing';
import { SpeakerRoleController } from './speaker-role.controller';

describe('SpeakerRole Controller', () => {
  let controller: SpeakerRoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpeakerRoleController],
    }).compile();

    controller = module.get<SpeakerRoleController>(SpeakerRoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
