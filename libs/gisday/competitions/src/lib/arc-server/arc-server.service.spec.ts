import { Test, TestingModule } from '@nestjs/testing';
import { ArcServerService } from './arc-server.service';

describe('ArcServerService', () => {
  let service: ArcServerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArcServerService],
    }).compile();

    service = module.get<ArcServerService>(ArcServerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
