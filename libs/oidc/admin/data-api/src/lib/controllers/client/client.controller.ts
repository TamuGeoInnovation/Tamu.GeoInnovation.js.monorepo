import { Controller, Get, UseGuards } from '@nestjs/common';

import { Client, AdminGuard } from '@tamu-gisc/oidc/common';

import { ClientService } from '../../services/client/client.service';
import { BaseController } from '../_base/base.controller';

@Controller('clients')
export class ClientController extends BaseController<Client> {
  constructor(private readonly clientService: ClientService) {
    super(clientService);
  }

  @Get()
  @UseGuards(AdminGuard)
  public get() {
    return this.clientService.getEntities();
  }

  @Get('/auth')
  public getAuth() {
    return 200;
  }
}
