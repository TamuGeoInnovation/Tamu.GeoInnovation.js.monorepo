import { Test, TestingModule } from '@nestjs/testing';
import { ClientMetadataService } from './client-metadata.service';

describe('ClientMetadataService', () => {
  let service: ClientMetadataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientMetadataService],
    }).compile();

    service = module.get<ClientMetadataService>(ClientMetadataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
