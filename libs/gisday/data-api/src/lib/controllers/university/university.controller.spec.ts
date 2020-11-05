import { Test, TestingModule } from '@nestjs/testing';
import { UniversityController } from './university.controller';

describe('University Controller', () => {
  let controller: UniversityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UniversityController],
    }).compile();

    controller = module.get<UniversityController>(UniversityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
