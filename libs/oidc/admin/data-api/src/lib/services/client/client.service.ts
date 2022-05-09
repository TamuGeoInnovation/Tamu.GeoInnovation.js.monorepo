import { Injectable } from '@nestjs/common';

import { Repository } from 'typeorm';

import { Client } from '@tamu-gisc/oidc/common';

@Injectable()
export class ClientService {
  constructor(private readonly clientRepo: Repository<Client>) {}

  public async getAll() {
    return this.clientRepo.find();
  }
}

