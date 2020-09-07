import { Test, TestingModule } from '@nestjs/testing';
import { ClientMetadataController } from './client-metadata.controller';

describe('ClientMetadata Controller', () => {
  let controller: ClientMetadataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientMetadataController],
    }).compile();

    controller = module.get<ClientMetadataController>(ClientMetadataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
