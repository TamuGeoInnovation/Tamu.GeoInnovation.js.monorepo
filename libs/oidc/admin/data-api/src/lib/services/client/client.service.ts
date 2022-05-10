import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Client } from '@tamu-gisc/oidc/common';
import { BaseService } from '../_base/base.service';

@Injectable()
export class ClientService extends BaseService<Client> {
  constructor(@InjectRepository(Client) private clientRepo: Repository<Client>) {
    super(clientRepo);
  }
}
