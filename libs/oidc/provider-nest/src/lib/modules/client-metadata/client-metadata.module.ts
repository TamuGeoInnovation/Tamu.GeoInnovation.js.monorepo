import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientMetadataController } from '../../controllers/client-metadata/client-metadata.controller';
import { ClientMetadataService } from '../../services/client-metadata/client-metadata.service';
import { ClientMetadataRepo, GrantTypeRepo, RedirectUriRepo } from '../../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClientMetadataRepo, GrantTypeRepo, RedirectUriRepo])],
  providers: [ClientMetadataService],
  controllers: [ClientMetadataController]
})
export class ClientMetadataModule {}
