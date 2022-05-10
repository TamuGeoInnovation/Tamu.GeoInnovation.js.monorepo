import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Client } from '@tamu-gisc/oidc/common';

import { ClientController } from '../../controllers/client/client.controller';
import { ClientService } from '../../services/client/client.service';

@Module({
  imports: [TypeOrmModule.forFeature([Client])],
  controllers: [ClientController],
  providers: [ClientService]
})
export class ClientModule {}
