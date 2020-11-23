import { Controller, Get, HttpException, Param, Post, Req, HttpStatus } from '@nestjs/common';

import { Request } from 'express';

import { ClientMetadata, GrantType, ResponseType, TokenEndpointAuthMethod } from '../../entities/all.entity';
import { ClientMetadataService } from '../../services/client-metadata/client-metadata.service';

@Controller('client-metadata')
export class ClientMetadataController {
  constructor(private readonly clientMetadataService: ClientMetadataService) {}

  @Get()
  public async allClientGet() {
    return this.clientMetadataService.getAllClients();
  }

  @Get('test')
  public async getClientMetadataForOidcSetup() {
    const clients = await this.clientMetadataService.loadClientMetadaForOidcSetup();
    return clients;
  }

  @Get('grant')
  public async allGrantTypesGet() {
    return this.clientMetadataService.getAllGrantTypes();
  }

  @Get('response-type')
  public async allReponseTypesGet() {
    return this.clientMetadataService.getAllResponseTypes();
  }

  @Get('token-endpoint')
  public async allTokenEndpointAuthMethodsGet() {
    return this.clientMetadataService.getAllTokenEndpointAuthMethods();
  }

  @Get(':clientName')
  public async oneClientGet(@Param() params) {
    return this.clientMetadataService.getClient(params.clientName);
  }

  @Post()
  public async insertClientPost(@Req() req: Request) {
    try {
      const grants = await this.clientMetadataService.findGrantTypeEntities(req.body.grantTypes);
      const redirectUris = await this.clientMetadataService.createRedirectUriEntities(req.body.redirectUris);
      const responseTypes = await this.clientMetadataService.findResponseTypeEntities(req.body.responseTypes);
      const token_endpoint_auth_method = await this.clientMetadataService.findTokenEndpointAuthMethod(
        req.body.token_endpoint_auth_method
      );

      const _clientMetadata: Partial<ClientMetadata> = {
        clientName: req.body.clientName,
        clientSecret: req.body.clientSecret,
        grantTypes: grants,
        redirectUris: redirectUris,
        responseTypes: responseTypes,
        tokenEndpointAuthMethod: token_endpoint_auth_method
      };

      return this.clientMetadataService.insertClientMetadata(_clientMetadata);
    } catch (err) {
      throw new HttpException(err, HttpStatus.PARTIAL_CONTENT);
    }
  }

  @Post('grant')
  public async insertGrantTypePost(@Req() req: Request) {
    try {
      const _grant: Partial<GrantType> = {
        name: req.body.name,
        type: req.body.type,
        details: req.body.details
      };

      return this.clientMetadataService.insertGrantType(_grant);
    } catch (err) {
      throw new HttpException(err, HttpStatus.PARTIAL_CONTENT);
    }
  }

  @Post('response-type')
  public async insertResponseTypePost(@Req() req: Request) {
    try {
      const _responseType: Partial<ResponseType> = {
        type: req.body.type,
        details: req.body.details
      };

      return this.clientMetadataService.insertResponseType(_responseType);
    } catch (err) {
      throw new HttpException(err, HttpStatus.PARTIAL_CONTENT);
    }
  }

  @Post('token-endpoint')
  public async insertTokenEndpointAuthMethod(@Req() req: Request) {
    try {
      const _tokenEndpointMethod: Partial<TokenEndpointAuthMethod> = {
        type: req.body.type,
        details: req.body.details
      };

      return this.clientMetadataService.insertTokenEndpointAuthMethod(_tokenEndpointMethod);
    } catch (err) {
      throw new HttpException(err, HttpStatus.PARTIAL_CONTENT);
    }
  }
}
