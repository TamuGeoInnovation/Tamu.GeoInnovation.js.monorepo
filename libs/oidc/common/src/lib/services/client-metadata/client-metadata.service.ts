import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { In } from 'typeorm';
import * as deepmerge from 'deepmerge';

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
    clientMetadata.redirectUris.map((redirectUri) => {
      redirectUri.save();
    });
    return this.clientMetadataRepo.save(clientMetadata);
  }

  public async loadClientMetadaForOidcSetup() {
    const clients = await this.clientMetadataRepo.findAllDeep();
    const flattenedClients: IClientMetadata[] = this.flattenClientMetadataForReturn(clients);
    return flattenedClients;
  }

  private flattenClientMetadataForReturn(clients: ClientMetadata[]) {
    const flattenedClients: IClientMetadata[] = [];
    try {
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
    } catch (error) {
      console.warn('There was an error loading a clientMetdata', error);
    }
  }

  public async updateClientMetadata(_clientMetadata: Partial<ClientMetadata>) {
    const clientMetadata = await this.clientMetadataRepo.getClientMetadata(_clientMetadata.guid);
    const merged = deepmerge(clientMetadata as Partial<ClientMetadata>, _clientMetadata);
    return this.clientMetadataRepo.save(merged);
  }

  public async deleteClientMetadata(guid: string) {
    const clientMetadata = await this.clientMetadataRepo.getClientMetadata(guid);
    if (clientMetadata) {
      clientMetadata.remove();
    }
  }

  // GrantType functions
  public async findGrantTypeEntities(_grants: string[]) {
    return this.grantTypeRepo.find({
      type: In(_grants)
    });
  }

  public async getAllGrantTypes() {
    return this.grantTypeRepo.findAllShallow();
  }

  public async getGrantType(guid: string) {
    return this.grantTypeRepo.findOne({
      where: {
        guid
      }
    });
  }

  public async updateGrantType(_grantType: Partial<GrantType>) {
    const grantType = await this.grantTypeRepo.findOne({
      where: {
        guid: _grantType.guid
      }
    });
    const merged = deepmerge(grantType as Partial<GrantType>, _grantType);
    return this.grantTypeRepo.save(merged);
  }

  public async deleteGrantType(guid: string) {
    const grantType = await this.grantTypeRepo.findOne({
      where: {
        guid
      }
    });
    if (grantType) {
      grantType.remove();
    }
  }

  public async insertGrantType(_grant: Partial<GrantType>) {
    const grant = this.grantTypeRepo.create(_grant);

    return this.grantTypeRepo.insert(grant);
  }

  // RedirectUri functions
  public async createRedirectUriEntities(_redirectUris: string[]) {
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
  public async findResponseTypeEntities(_responseTypes: string[]) {
    return this.responseTypeRepo.find({
      type: In(_responseTypes)
    });
  }

  public async insertResponseType(_responseType: Partial<ResponseType>) {
    const responseType = this.responseTypeRepo.create(_responseType);

    return this.responseTypeRepo.insert(responseType);
  }

  public async getAllResponseTypes() {
    return this.responseTypeRepo.find();
  }

  public async getResponseType(guid: string) {
    return this.responseTypeRepo.findOne({
      where: {
        guid
      }
    });
  }

  public async updateResponseType(_responseType: Partial<ResponseType>) {
    const responseType = await this.responseTypeRepo.findOne({
      where: {
        guid: _responseType
      }
    });
    const merged = deepmerge(responseType as Partial<ResponseType>, _responseType);
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
  public async findTokenEndpointAuthMethod(_tokenEndpoint: string) {
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

  public async updateTokenEndpointAuthMethod(_tokenEndpointAuthMethod: Partial<TokenEndpointAuthMethod>) {
    const tokenEndpointAuthMethod = await this.tokenEndpointRepo.findOne({
      where: {
        guid: _tokenEndpointAuthMethod.guid
      }
    });

    const merged = deepmerge(tokenEndpointAuthMethod as Partial<TokenEndpointAuthMethod>, _tokenEndpointAuthMethod);

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
