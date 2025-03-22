import { Test, TestingModule } from '@nestjs/testing';
import { TurnstileVerifyService } from './turnstile-verify.service';

describe('TurnstileVerifyService', () => {
  let service: TurnstileVerifyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TurnstileVerifyService]
    }).compile();

    service = module.get<TurnstileVerifyService>(TurnstileVerifyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
