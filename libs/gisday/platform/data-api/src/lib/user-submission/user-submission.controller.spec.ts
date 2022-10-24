import { Test, TestingModule } from '@nestjs/testing';
import { UserSubmissionController } from './user-submission.controller';

describe('UserSubmission Controller', () => {
  let controller: UserSubmissionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSubmissionController]
    }).compile();

    controller = module.get<UserSubmissionController>(UserSubmissionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
