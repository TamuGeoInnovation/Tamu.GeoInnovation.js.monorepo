import { Test, TestingModule } from '@nestjs/testing';
import { CourseCreditController } from './course-credit.controller';

describe('CourseCredit Controller', () => {
  let controller: CourseCreditController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseCreditController],
    }).compile();

    controller = module.get<CourseCreditController>(CourseCreditController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
