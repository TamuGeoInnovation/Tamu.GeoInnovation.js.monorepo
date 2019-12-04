import { Test, TestingModule } from '@nestjs/testing';
import { ProFluxService } from './proflux.service';

describe('ProFluxService', () => {
  let service: ProFluxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProFluxService]
    }).compile();

    service = module.get<ProFluxService>(ProFluxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
