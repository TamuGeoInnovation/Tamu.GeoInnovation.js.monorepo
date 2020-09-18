import { Test, TestingModule } from '@nestjs/testing';
import { ClassProvider } from './class.provider';

describe('ClassProvider', () => {
  let provider: ClassProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassProvider]
    }).compile();

    provider = module.get<ClassProvider>(ClassProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
