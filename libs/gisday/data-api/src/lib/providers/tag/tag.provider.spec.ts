import { Test, TestingModule } from '@nestjs/testing';
import { TagProvider } from './tag.provider';

describe('TagProvider', () => {
  let provider: TagProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TagProvider]
    }).compile();

    provider = module.get<TagProvider>(TagProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
