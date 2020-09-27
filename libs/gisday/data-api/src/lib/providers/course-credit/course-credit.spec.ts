import { Test, TestingModule } from '@nestjs/testing';
import { CourseCreditProvider } from './course-credit.provider';

describe('CourseCreditProvider', () => {
  let provider: CourseCreditProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseCreditProvider]
    }).compile();

    provider = module.get<CourseCreditProvider>(CourseCreditProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
