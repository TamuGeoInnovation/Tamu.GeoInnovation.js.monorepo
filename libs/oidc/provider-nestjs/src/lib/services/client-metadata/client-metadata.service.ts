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

  public async getClientByGuid(guid: string) {
    if (guid) {
      return this.clientMetadataRepo.findByKeyDeep('guid', guid);
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
    try {
      clients.map((curr) => {
        let flattened: IClientMetadata = {
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
        // flattened.token_endpoint_auth_method = curr.tokenEndpointAuthMethods.map((tokenEndpoint) => {
        //   return tokenEndpoint.type;
        // });
        flattenedClients.push(flattened);
      });
      return flattenedClients;
    } catch (error) {
      console.warn('There was an error loading a clientMetdata', error);
    }
  }

  public async updateClientMetadata(req: Request) {
    const guid = req.body.guid;
    const clientMetadata = await this.clientMetadataRepo.findOne({
      where: {
        guid
      }
    });
    const merged = deepmerge(clientMetadata as Partial<ClientMetadata>, req.body);
    return this.clientMetadataRepo.save(merged);
  }

  public async deleteClientMetadata(guid: string) {
    const clientMetadata = await this.clientMetadataRepo.findOne({
      where: {
        guid
      }
    });
    if (clientMetadata) {
      clientMetadata.remove();
    }
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
  private async createRedirectUriEntities(_redirectUris: string): Promise<RedirectUri[]> {
    const tokens: string[] = _redirectUris.split(',');
    const redirectUris: RedirectUri[] = [];
    try {
      tokens.map((value, i) => {
        const redirectUriPartial: Partial<RedirectUri> = {
          url: value.trim()
        };
        const redirectUri = this.redirectUriRepo.create(redirectUriPartial);
        redirectUris.push(redirectUri);
      });
      return redirectUris;
    } catch (error) {
      debugger;
      console.warn(error);
    }
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

  public async getResponseType(guid: string) {
    return this.responseTypeRepo.findOne({
      where: {
        guid
      }
    });
  }

  public async updateResponseType(req: Request) {
    const guid = req.body.guid;
    const responseType = await this.responseTypeRepo.findOne({
      where: {
        guid
      }
    });
    const merged = deepmerge(responseType as Partial<ResponseType>, req.body);
    return this.responseTypeRepo.save(merged);
  }

  public async deleteResponseType(guid: string) {
    const responseType = await this.responseTypeRepo.findOne({
      where: {
        guid
      }
    });
    if (responseType) {
      responseType.remove();
    }
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

  public async getTokenEndpointAuthMethod(guid: string) {
    return this.tokenEndpointRepo.findOne({
      where: {
        guid
      }
    });
  }

  public async updateTokenEndpointAuthMethod(req: Request) {
    const guid = req.body.guid;
    const tokenEndpointAuthMethod = await this.tokenEndpointRepo.findOne({
      where: {
        guid
      }
    });
    const merged = deepmerge(tokenEndpointAuthMethod as Partial<TokenEndpointAuthMethod>, req.body);
    return this.tokenEndpointRepo.save(merged);
  }

  public async deleteTokenEndpointAuthMethod(guid: string) {
    const tokenEndpointAuthMethod = await this.tokenEndpointRepo.findOne({
      where: {
        guid
      }
    });
    if (tokenEndpointAuthMethod) {
      tokenEndpointAuthMethod.remove();
    }
  }
}
