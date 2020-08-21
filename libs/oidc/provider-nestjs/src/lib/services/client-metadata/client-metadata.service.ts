import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import {
  IClientMetadata,
  ClientMetadata,
  ClientMetadataRepo,
  GrantTypeRepo,
  GrantType,
  RedirectUri,
  RedirectUriRepo,
  ResponseType,
  ResponseTypeRepo,
  TokenEndpointAuthMethod,
  TokenEndpointAuthMethodRepo
} from '../../entities/all.entity';

@Injectable()
export class ClientMetadataService {
  constructor(
    private readonly clientMetadataRepo: ClientMetadataRepo,
    private readonly grantTypeRepo: GrantTypeRepo,
    private readonly redirectUriRepo: RedirectUriRepo,
    private readonly responseTypeRepo: ResponseTypeRepo,
    private readonly tokenEndpointRepo: TokenEndpointAuthMethodRepo
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
    return this.clientMetadataRepo.findAllDeep();
  }

  public async insertClientMetadata(_clientMetadata: Partial<ClientMetadata>) {
    const clientMetadata = this.clientMetadataRepo.create(_clientMetadata);

    return this.clientMetadataRepo.save(clientMetadata);
  }

  public async loadClientMetadaForOidcSetup() {
    const clients = await this.clientMetadataRepo.findAllDeep();
    const flattenedClients: IClientMetadata[] = this.flattenClientMetadataForReturn(clients);
    return flattenedClients;
  }

  private flattenClientMetadataForReturn(clients: ClientMetadata[]): IClientMetadata[] {
    const flattenedClients: IClientMetadata[] = [];
    clients.map((curr) => {
      const flattened: IClientMetadata = {
        client_id: null,
        client_secret: null,
        grant_types: [],
        redirect_uris: [],
        response_types: [],
        token_endpoint_auth_method: null
      };
      flattened.client_id = curr.clientName;
      flattened.client_secret = curr.clientSecret;
      flattened.grant_types = curr.grantTypes.map((grantType) => {
        return grantType.type;
      });
      flattened.redirect_uris = curr.redirectUris.map((redirectUri) => {
        return redirectUri.url;
      });
      flattened.response_types = curr.responseTypes.map((responseType) => {
        return responseType.type;
      });
      flattened.token_endpoint_auth_method = curr.tokenEndpointAuthMethod.type;
      flattenedClients.push(flattened);
    });
    return flattenedClients;
  }

  // GrantType functions
  public async findGrantTypeEntities(_grants: string[]): Promise<GrantType[]> {
    return this.grantTypeRepo.find({
      type: In(_grants)
    });
  }

  public async getAllGrantTypes() {
    return this.grantTypeRepo.findAllShallow();
  }

  public async insertGrantType(_grant: Partial<GrantType>) {
    const grant = this.grantTypeRepo.create(_grant);
    return this.grantTypeRepo.insert(grant);
  }

  // RedirectUri functions
  public async createRedirectUriEntities(_redirectUris: string[]): Promise<RedirectUri[]> {
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
  public async findResponseTypeEntities(_responseTypes: string[]): Promise<ResponseType[]> {
    return this.responseTypeRepo.find({
      type: In(_responseTypes)
    });
  }

  public async insertResponseType(_responseType: Partial<ResponseType>) {
    const responseType = this.responseTypeRepo.create(_responseType);
    return this.responseTypeRepo.insert(responseType);
  }

  public async getAllResponseTypes() {
    return this.responseTypeRepo.findAllShallow();
  }

  // TokenEndpointAuthMethod functions
  public async findTokenEndpointAuthMethod(_tokenEndpoint: string): Promise<TokenEndpointAuthMethod> {
    return this.tokenEndpointRepo.findOne({
      where: {
        type: _tokenEndpoint
      }
    });
  }

  public async insertTokenEndpointAuthMethod(_tokenEndpointMethod: Partial<TokenEndpointAuthMethod>) {
    const tokenEndpointMethod = this.tokenEndpointRepo.create(_tokenEndpointMethod);
    return this.tokenEndpointRepo.insert(tokenEndpointMethod);
  }

  public async getAllTokenEndpointAuthMethods() {
    return this.tokenEndpointRepo.findAllShallow();
  }
}
