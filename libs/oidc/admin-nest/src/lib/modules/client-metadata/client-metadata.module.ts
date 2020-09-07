import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientMetadataController } from '../../controllers/client-metadata/client-metadata.controller';
import { ClientMetadataService } from '../../services/client-metadata/client-metadata.service';
import {
  ClientMetadataRepo,
  GrantTypeRepo,
  RedirectUriRepo,
  ResponseTypeRepo,
  TokenEndpointAuthMethodRepo,
  ClientMetadata
} from '../../entities/all.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClientMetadataRepo,
      GrantTypeRepo,
      RedirectUriRepo,
      ResponseTypeRepo,
      TokenEndpointAuthMethodRepo
    ])
  ],
  providers: [ClientMetadataService],
  controllers: [ClientMetadataController],
  exports: [ClientMetadataService]
})
export class ClientMetadataModule {}
