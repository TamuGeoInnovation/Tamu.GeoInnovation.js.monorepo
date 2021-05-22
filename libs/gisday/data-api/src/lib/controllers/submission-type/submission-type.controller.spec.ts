import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionTypeController } from './submission-type.controller';

describe('SubmissionType Controller', () => {
  let controller: SubmissionTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionTypeController],
    }).compile();

    controller = module.get<SubmissionTypeController>(SubmissionTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
