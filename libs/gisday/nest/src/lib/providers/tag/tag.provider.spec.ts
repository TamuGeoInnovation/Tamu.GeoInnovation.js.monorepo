import { Test, TestingModule } from '@nestjs/testing';
import { Tag } from './tag.provider';

describe('Tag', () => {
  let provider: Tag;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Tag]
    }).compile();

    provider = module.get<Tag>(Tag);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
