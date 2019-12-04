import { Test, TestingModule } from '@nestjs/testing';
import { AncillaryService } from './ancillary.service';

describe('AncillaryService', () => {
  let service: AncillaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AncillaryService],
    }).compile();

    service = module.get<AncillaryService>(AncillaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
