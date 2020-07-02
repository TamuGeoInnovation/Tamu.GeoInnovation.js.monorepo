import { Module } from '@nestjs/common';
import { Connection } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientMetadataController } from '../../controllers/client-metadata/client-metadata.controller';
import { ClientMetadataService } from '../../services/client-metadata/client-metadata.service';
import { ClientMetadata, ClientMetadataRepo } from '../../entities/all.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ClientMetadataRepo])],
    exports: [ClientMetadataService],
    // providers: [{
    //     provide: 'CLIENTMETADATA_REPO',
    //     useFactory: (connection: Connection) => connection.getRepository(ClientMetadata)
    // }, ClientMetadataService],
    providers: [ClientMetadataService],
    controllers: [ClientMetadataController],
})
export class ClientMetadataModule { }
