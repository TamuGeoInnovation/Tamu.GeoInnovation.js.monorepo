import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import {
  ClientMetadata,
  ClientMetadataRepo,
  GrantTypeRepo,
  GrantType,
  RedirectUri,
  RedirectUriRepo,
  ResponseType,
  ResponseTypeRepo
} from '../../entities/all.entity';
import { In } from 'typeorm';

@Injectable()
export class ClientMetadataService {
  constructor(
    private readonly clientMetadataRepo: ClientMetadataRepo,
    private readonly grantTypeRepo: GrantTypeRepo,
    private readonly redirectUriRepo: RedirectUriRepo,
    private readonly responseTypeRepo: ResponseTypeRepo
  ) {}

  // ClientMetadata functions
  public async getClient(clientName: string) {
    if (clientName) {
      return this.clientMetadataRepo.findByKeyDeep('clientName', clientName);
    } else {
      throw new Error('No clientIdentifier provided');
    }
  }

  public async getAllClients() {
    return this.clientMetadataRepo.findAll();
  }

  public async insertClientMetadata(req: Request) {
    try {
      const grants = await this.findGrantTypeEntities(req.body.grantTypes);
      const redirectUris = await this.createRedirectUriEntities(req.body.redirectUris);

      const _clientMetadata: Partial<ClientMetadata> = {
        clientName: req.body.clientName,
        clientSecret: req.body.clientSecret,
        token_endpoint_auth_method: req.body.token_endpoint_auth_method,
        grantTypes: grants,
        redirectUris: redirectUris
      };
      const clientMetadata = this.clientMetadataRepo.create(_clientMetadata);

      return this.clientMetadataRepo.save(clientMetadata);
    } catch (generalErr) {
      throw generalErr;
    }
  }

  // GrantType functions
  private async findGrantTypeEntities(_grants: string[]): Promise<GrantType[]> {
    return this.grantTypeRepo.find({
      type: In(_grants)
    });
  }

  public async getAllGrantTypes() {
    return this.grantTypeRepo.findAll();
  }

  public async insertGrantType(req: Request) {
    const _grant: Partial<GrantType> = {
      name: req.body.name,
      type: req.body.type,
      details: req.body.details
    };
    const grant = this.grantTypeRepo.create(_grant);
    return this.grantTypeRepo.insert(grant);
  }

  // RedirectUri functions
  private async createRedirectUriEntities(_redirectUris: string[]): Promise<RedirectUri[]> {
    const redirectUris: RedirectUri[] = [];
    _redirectUris.map((value, i) => {
      const redirectUriPartial: Partial<RedirectUri> = {
        url: value
      };
      const redirectUri = this.redirectUriRepo.create(redirectUriPartial);
      redirectUris.push(redirectUri);
    });
    return redirectUris;
  }

  // ResponseType functions
  public async insertResponseType(req: Request) {
    const _responseType: Partial<ResponseType> = {
      type: req.body.type,
      details: req.body.details
    };
    const responseType = this.responseTypeRepo.create(_responseType);
    return this.responseTypeRepo.insert(responseType);
  }

  public async getAllResponseTypes() {
    return this.responseTypeRepo.findAll();
  }
}
