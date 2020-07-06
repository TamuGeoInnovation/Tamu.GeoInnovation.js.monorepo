import { Injectable } from '@nestjs/common';
import { Request } from 'express';
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
import { In } from 'typeorm';
import { ClientAuthMethod } from 'oidc-provider';

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
    return this.clientMetadataRepo.findAllShallow();
  }

  public async insertClientMetadata(req: Request) {
    try {
      const grants = await this.findGrantTypeEntities(req.body.grantTypes);
      const redirectUris = await this.createRedirectUriEntities(req.body.redirectUris);
      const responseTypes = await this.findResponseTypeEntities(req.body.responseTypes);
      const token_endpoint_auth_method = await this.findTokenEndpointAuthMethod(req.body.token_endpoint_auth_method);

      // TODO: Fix this ClientAuthMethod cast
      const _clientMetadata: Partial<ClientMetadata> = {
        clientName: req.body.clientName,
        clientSecret: req.body.clientSecret,
        grantTypes: grants,
        redirectUris: redirectUris,
        responseTypes: responseTypes,
        tokenEndpointAuthMethod: token_endpoint_auth_method
      };
      const clientMetadata = this.clientMetadataRepo.create(_clientMetadata);

      return this.clientMetadataRepo.save(clientMetadata);
    } catch (generalErr) {
      throw generalErr;
    }
  }

  public async loadClientMetadaForOidcSetup() {
    const clients = await this.clientMetadataRepo.findAllDeep();
    const flattenedClients: IClientMetadata[] = this.flattenClientMetadataForReturn(clients);
    return flattenedClients;
  }

  private flattenClientMetadataForReturn(clients: ClientMetadata[]): IClientMetadata[] {
    const flattenedClients: IClientMetadata[] = [];
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
      // flattened.token_endpoint_auth_method = curr.tokenEndpointAuthMethods.map((tokenEndpoint) => {
      //   return tokenEndpoint.type;
      // });
      flattenedClients.push(flattened);
    });
    return flattenedClients;
  }

  // GrantType functions
  private async findGrantTypeEntities(_grants: string[]): Promise<GrantType[]> {
    return this.grantTypeRepo.find({
      type: In(_grants)
    });
  }

  public async getAllGrantTypes() {
    return this.grantTypeRepo.findAllShallow();
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
  private async findResponseTypeEntities(_responseTypes: string[]): Promise<ResponseType[]> {
    return this.responseTypeRepo.find({
      type: In(_responseTypes)
    });
  }

  public async insertResponseType(req: Request) {
    const _responseType: Partial<ResponseType> = {
      type: req.body.type,
      details: req.body.details
    };
    const responseType = this.responseTypeRepo.create(_responseType);
    return this.responseTypeRepo.insert(responseType);
  }

  public async getAllResponseTypes() {
    return this.responseTypeRepo.findAllShallow();
  }

  // TokenEndpointAuthMethod functions
  private async findTokenEndpointAuthMethod(_tokenEndpoint: string): Promise<TokenEndpointAuthMethod> {
    return this.tokenEndpointRepo.findOne(_tokenEndpoint);
  }

  public async insertTokenEndpointAuthMethod(req: Request) {
    const _tokenEndpointMethod: Partial<TokenEndpointAuthMethod> = {
      type: req.body.type,
      details: req.body.details
    };
    const tokenEndpointMethod = this.tokenEndpointRepo.create(_tokenEndpointMethod);
    return this.tokenEndpointRepo.insert(tokenEndpointMethod);
  }

  public async getAllTokenEndpointAuthMethods() {
    return this.tokenEndpointRepo.findAllShallow();
  }
}
