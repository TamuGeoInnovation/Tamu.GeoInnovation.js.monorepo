import { Test, TestingModule } from '@nestjs/testing';
import { CountyClaimsService } from './county-claims.service';

describe('CountyClaimsService', () => {
  let service: CountyClaimsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CountyClaimsService],
    }).compile();

    service = module.get<CountyClaimsService>(CountyClaimsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
