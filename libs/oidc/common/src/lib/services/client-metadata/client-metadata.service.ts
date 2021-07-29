import { Injectable } from '@nestjs/common';

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
  TokenEndpointAuthMethodRepo,
  BackchannelLogoutUri,
  BackchannelLogoutUriRepo
} from '../../entities/all.entity';

@Injectable()
export class ClientMetadataService {
  constructor(
    private readonly clientMetadataRepo: ClientMetadataRepo,
    private readonly grantTypeRepo: GrantTypeRepo,
    private readonly redirectUriRepo: RedirectUriRepo,
    private readonly responseTypeRepo: ResponseTypeRepo,
    private readonly tokenEndpointRepo: TokenEndpointAuthMethodRepo,
    private readonly backchannelUriRepo: BackchannelLogoutUriRepo
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

  public async insertClientMetadataForAdminSite(
    clientName: string,
    clientSecret: string,
    redirectUri: string,
    backchannelLogoutUri: string
  ) {
    const adminMetadata = {
      clientName: clientName,
      clientSecret: clientSecret,
      grants: ['refresh_token', 'authorization_code'],
      redirectUris: [redirectUri],
      responseTypes: ['code'],
      token_endpoint_auth_method: 'client_secret_basic',
      backchannelLogoutUris: [backchannelLogoutUri]
    };
    const grants = await this.findGrantTypeEntities(adminMetadata.grants);
    const redirectUris = this.createRedirectUriEntities(adminMetadata.redirectUris);
    const responseTypes = await this.findResponseTypeEntities(adminMetadata.responseTypes);
    const token_endpoint_auth_method = await this.findTokenEndpointAuthMethod(adminMetadata.token_endpoint_auth_method);
    const backchannelUris = this.createBackchannelLogoutUri(adminMetadata.backchannelLogoutUris);

    const _clientMetadata: Partial<ClientMetadata> = {
      clientName: adminMetadata.clientName,
      clientSecret: adminMetadata.clientSecret,
      grantTypes: grants,
      redirectUris: redirectUris,
      responseTypes: responseTypes,
      tokenEndpointAuthMethod: token_endpoint_auth_method,
      backchannelLogoutUris: backchannelUris
    };

    return this.insertClientMetadata(_clientMetadata);
  }

  public async insertClientMetadata(_clientMetadata: Partial<ClientMetadata>) {
    const clientMetadata = this.clientMetadataRepo.create(_clientMetadata);

    await Promise.all([
      clientMetadata.redirectUris.map((redirectUri) => {
        redirectUri.save();
      }),
      clientMetadata.backchannelLogoutUris.map((backchannelUri) => {
        backchannelUri.save();
      })
    ]);

    return this.clientMetadataRepo.save(clientMetadata);
  }

  public async loadClientMetadaForOidcSetup() {
    const clients = await this.clientMetadataRepo.find({
      relations: ['grantTypes', 'redirectUris', 'responseTypes', 'tokenEndpointAuthMethod', 'backchannelLogoutUris']
    });
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
          token_endpoint_auth_method: null,
          post_logout_redirect_uris: []
        };

        flattened.client_id = curr.clientName;
        flattened.client_secret = curr.clientSecret;

        flattened.grant_types = curr.grantTypes.map((grantType) => {
          return grantType.type;
        });

        flattened.redirect_uris = curr.redirectUris.map((redirectUri) => {
          return redirectUri.url;
        });

        flattened.post_logout_redirect_uris = curr.backchannelLogoutUris.map((logoutUri) => {
          return logoutUri.url;
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
    clientMetadata.grantTypes = _clientMetadata.grantTypes;
    clientMetadata.responseTypes = _clientMetadata.responseTypes;
    clientMetadata.redirectUris = _clientMetadata.redirectUris;
    clientMetadata.tokenEndpointAuthMethod = _clientMetadata.tokenEndpointAuthMethod;
    clientMetadata.redirectUris.map((redirectUri) => {
      redirectUri.save();
    });

    return this.clientMetadataRepo.save(clientMetadata);
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

  public async insertDefaultGrantTypes() {
    // https://oauth.net/2/grant-types/
    // https://stackoverflow.com/questions/51403066/grant-type-vs-response-type-in-oauth2-0-oidc
    // 'refresh_token', 'authorization_code'

    return Promise.all([
      this.insertGrantType({
        type: 'refresh_token',
        name: 'Refresh',
        details: 'Allows you to get a Refresh Token back'
      }),
      this.insertGrantType({
        type: 'authorization_code',
        name: 'Authorization',
        details: 'Authorization'
      })
    ]);
  }

  public async insertGrantType(_grant: Partial<GrantType>) {
    const grant = this.grantTypeRepo.create(_grant);

    return this.grantTypeRepo.insert(grant);
  }

  // RedirectUri functions
  public createRedirectUriEntities(_redirectUris: string[]) {
    const redirectUris: RedirectUri[] = [];

    _redirectUris.forEach((value, i) => {
      const redirectUriPartial: Partial<RedirectUri> = {
        url: value
      };
      const redirectUri = this.redirectUriRepo.create(redirectUriPartial);
      redirectUris.push(redirectUri);
    });

    return redirectUris;
  }

  // BackchannelLogoutUri functions
  public createBackchannelLogoutUri(_backchannelLogoutUris: string[]) {
    const backchannelLogoutUris: BackchannelLogoutUri[] = [];

    _backchannelLogoutUris.forEach((value, i) => {
      const backchannelLogoutUri: Partial<BackchannelLogoutUri> = {
        url: value
      };
      const logoutUri = this.backchannelUriRepo.create(backchannelLogoutUri);
      backchannelLogoutUris.push(logoutUri);
    });

    return backchannelLogoutUris;
  }

  // ResponseType functions
  public async findResponseTypeEntities(_responseTypes: string[]) {
    return this.responseTypeRepo.find({
      type: In(_responseTypes)
    });
  }

  public async insertDefaultResponseTypes() {
    // https://tools.ietf.org/html/rfc6749#section-3.1.1

    return Promise.all([
      this.insertResponseType({
        details: 'Authorization Code',
        type: 'code'
      }),
      this.insertResponseType({
        details: 'Authorization Token',
        type: 'token'
      })
    ]);
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

  public async insertDefaultTokenEndpointAuthMethods() {
    // client_secret_basic, client_secret_jwt
    return Promise.all([
      this.insertTokenEndpointAuthMethod({
        type: 'client_secret_basic',
        details: 'Allows usage of the bearer token header'
      }),
      this.insertTokenEndpointAuthMethod({
        type: 'client_secret_jwt',
        details: 'Allows usage of JWTs'
      })
    ]);
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
