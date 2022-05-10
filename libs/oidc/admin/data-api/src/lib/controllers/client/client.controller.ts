import { Controller, Get, UseGuards } from '@nestjs/common';

import { Client } from '@tamu-gisc/oidc/common';

import { ClientService } from '../../services/client/client.service';
import { BaseController } from '../_base/base.controller';
import { AuthorizationGuard } from '../../guards/authorization.guard';

@Controller('clients')
export class ClientController extends BaseController<Client> {
  constructor(private readonly clientService: ClientService) {
    super(clientService);
  }

  @Get()
  @UseGuards(AuthorizationGuard)
  public get() {
    return 200;
  }
}
