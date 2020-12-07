import { Controller, Get, Param, Post, Patch, Delete, UseGuards, Body, HttpStatus, HttpException } from '@nestjs/common';

import { AdminRoleGuard } from '@tamu-gisc/oidc/client';

import { ClientMetadata, GrantType, ResponseType, TokenEndpointAuthMethod } from '../../entities/all.entity';
import { ClientMetadataService } from '../../services/client-metadata/client-metadata.service';

// @UseGuards(AdminRoleGuard)
@Controller('client-metadata')
export class ClientMetadataController {
  constructor(private readonly clientMetadataService: ClientMetadataService) {}

  @Get('startup')
  public async getClientMetadataForOidcSetup() {
    const clients = await this.clientMetadataService.loadClientMetadaForOidcSetup();

    return clients;
  }

  @Get('grant')
  public async allGrantTypesGet() {
    return this.clientMetadataService.getAllGrantTypes();
  }

  @Get('grant/:grantTypeGuid')
  public async oneGrantTypesGet(@Param() params) {
    return this.clientMetadataService.getGrantType(params.grantTypeGuid);
  }

  @Post('grant')
  public async insertGrantTypePost(@Body() body) {
    try {
      const _grant: Partial<GrantType> = {
        name: body.name,
        type: body.type,
        details: body.details
      };

      return this.clientMetadataService.insertGrantType(_grant);
    } catch (err) {
      throw new HttpException(err, HttpStatus.PARTIAL_CONTENT);
    }
  }

  @Patch('grant/update')
  public async updateExistingGrantType(@Body() body) {
    const grantType: Partial<GrantType> = {
      ...body
    };

    return this.clientMetadataService.updateGrantType(grantType);
  }

  @Delete('grant/delete/:grantTypeGuid')
  public async deleteGrantType(@Param() params) {
    return this.clientMetadataService.deleteGrantType(params.grantTypeGuid);
  }

  @Get('response-type')
  public async allReponseTypesGet() {
    return this.clientMetadataService.getAllResponseTypes();
  }

  @Get('response-type/:responseTypeGuid')
  public async oneReponseTypesGet(@Param() params) {
    return this.clientMetadataService.getResponseType(params.responseTypeGuid);
  }

  @Patch('response-type/update')
  public async updateResponseType(@Body() body) {
    const responseType: Partial<ResponseType> = {
      ...body
    };

    return this.clientMetadataService.updateResponseType(responseType);
  }

  @Delete('response-type/delete/:responseTypeGuid')
  public async deleteResponseType(@Param() params) {
    return this.clientMetadataService.deleteResponseType(params.responseTypeGuid);
  }

  @Get('token-endpoint')
  public async allTokenEndpointAuthMethodsGet() {
    return this.clientMetadataService.getAllTokenEndpointAuthMethods();
  }

  @Post('response-type')
  public async insertResponseTypePost(@Body() body) {
    const responseType: Partial<ResponseType> = {
      ...body
    };

    return this.clientMetadataService.insertResponseType(responseType);
  }

  @Post('token-endpoint')
  public async insertTokenEndpointAuthMethod(@Body() body) {
    const tokenEndpoint: Partial<TokenEndpointAuthMethod> = {
      ...body
    };

    return this.clientMetadataService.insertTokenEndpointAuthMethod(tokenEndpoint);
  }

  @Get('token-endpoint/:tokenEndpointAuthMethodGuid')
  public async oneTokenEndpointAuthMethod(@Param() params) {
    return this.clientMetadataService.getTokenEndpointAuthMethod(params.tokenEndpointAuthMethodGuid);
  }

  @Patch('token-endpoint/update')
  public async updateTokenEndpointAuthMethod(@Body() body) {
    const tokenEndpoint: Partial<TokenEndpointAuthMethod> = {
      ...body
    };

    return this.clientMetadataService.updateTokenEndpointAuthMethod(tokenEndpoint);
  }

  @Delete('token-endpoint/delete/:tokenEndpointAuthMethodGuid')
  public async deleteTokenEndpointAuthMethod(@Param() params) {
    return this.clientMetadataService.deleteTokenEndpointAuthMethod(params.tokenEndpointAuthMethodGuid);
  }

  @Get()
  public async allClientGet() {
    return this.clientMetadataService.getAllClients();
  }

  @Get(':clientMetadataGuid')
  public async oneClientMetadataGet(@Param() params) {
    const clientIdentifier: string = params.clientMetadataGuid;

    if (clientIdentifier.includes('-')) {
      // search by client guid
      return this.clientMetadataService.getClientByGuid(clientIdentifier);
    } else {
      // looks like we're searching by client name
      return this.clientMetadataService.getClient(clientIdentifier);
    }
  }

  @Get(':clientName')
  public async oneClientGet(@Param() params) {}

  @Post()
  public async insertClientPost(@Body() body) {
    const grants = await this.clientMetadataService.findGrantTypeEntities(body.grantTypes);
    const redirectUris = await this.clientMetadataService.createRedirectUriEntities(body.redirectUris);
    const responseTypes = await this.clientMetadataService.findResponseTypeEntities(body.responseTypes);
    const token_endpoint_auth_method = await this.clientMetadataService.findTokenEndpointAuthMethod(
      body.token_endpoint_auth_method
    );

    const _clientMetadata: Partial<ClientMetadata> = {
      clientName: body.clientName,
      clientSecret: body.clientSecret,
      grantTypes: grants,
      redirectUris: redirectUris,
      responseTypes: responseTypes,
      tokenEndpointAuthMethod: token_endpoint_auth_method
    };

    return this.clientMetadataService.insertClientMetadata(_clientMetadata);
  }

  @Patch('update')
  public async updateClient(@Body() body) {
    const clientMetdata: Partial<ClientMetadata> = {
      ...body
    };

    return this.clientMetadataService.updateClientMetadata(clientMetdata);
  }

  @Delete('delete/:clientMetadataGuid')
  public async deleteClientMetadata(@Param() params) {
    return this.clientMetadataService.deleteClientMetadata(params.clientMetadataGuid);
  }
}
