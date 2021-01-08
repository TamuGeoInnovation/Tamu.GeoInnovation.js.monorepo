import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ClientMetadataRepo,
  GrantTypeRepo,
  RedirectUriRepo,
  ResponseTypeRepo,
  TokenEndpointAuthMethodRepo
} from '../../entities/all.entity';

import { ClientMetadataService } from '../../services/client-metadata/client-metadata.service';

import { ClientMetadataController } from './client-metadata.controller';

describe('ClientMetadata Controller', () => {
  let controller: ClientMetadataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientMetadataController],
      providers: [
        ClientMetadataService,
        { provide: getRepositoryToken(ClientMetadataRepo), useValue: {} },
        { provide: getRepositoryToken(GrantTypeRepo), useValue: {} },
        { provide: getRepositoryToken(RedirectUriRepo), useValue: {} },
        { provide: getRepositoryToken(ResponseTypeRepo), useValue: {} },
        { provide: getRepositoryToken(TokenEndpointAuthMethodRepo), useValue: {} }
      ]
    }).compile();

    controller = module.get<ClientMetadataController>(ClientMetadataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
