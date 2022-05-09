import { Controller } from '@nestjs/common';
import { Client } from '@tamu-gisc/oidc/common';
import { BaseController } from '../_base/base.controller';

@Controller('client')
export class ClientController extends BaseController<Client> {}

