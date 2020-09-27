import { Test, TestingModule } from '@nestjs/testing';
import { CourseCredit } from './course-credit';

describe('CourseCredit', () => {
  let provider: CourseCredit;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseCredit],
    }).compile();

    provider = module.get<CourseCredit>(CourseCredit);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
