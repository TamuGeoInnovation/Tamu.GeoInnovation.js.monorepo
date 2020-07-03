import { Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ClientMetadata as OidcClientMetadata } from 'oidc-provider';
import { ClientMetadataService } from '../../services/client-metadata/client-metadata.service';

@Controller('client-metadata')
export class ClientMetadataController {
  constructor(private readonly clientMetadataService: ClientMetadataService) {}

  @Get()
  async allClientGet() {
    return this.clientMetadataService.getAllClients();
  }

  @Get('test')
  async getClientMetadataForOidcSetup() {
    // {
    //   client_id: 'oidc-client-test',
    //   client_secret: 'pppssssssttttheykidwantsomekandy',
    //   grant_types: ['refresh_token', 'authorization_code'],
    //   redirect_uris: ['http://localhost:3001/oidc/auth/callback'],
    //   response_types: ['code'],
    //   token_endpoint_auth_method: 'client_secret_basic'
    // }
    const clients = await this.clientMetadataService.loadClientMetadaForOidcSetup();
    return clients;
  }

  @Get('grant')
  async allGrantTypesGet() {
    return this.clientMetadataService.getAllGrantTypes();
  }

  @Get('response-type')
  async allReponseTypesGet() {
    return this.clientMetadataService.getAllResponseTypes();
  }

  @Get('token-endpoint')
  async allTokenEndpointAuthMethodsGet() {
    return this.clientMetadataService.getAllTokenEndpointAuthMethods();
  }

  @Get(':clientName')
  async oneClientGet(@Param() params) {
    return this.clientMetadataService.getClient(params.clientName);
  }

  @Post()
  async insertClientPost(@Req() req: Request) {
    return this.clientMetadataService.insertClientMetadata(req);
  }

  @Post('grant')
  async insertGrantTypePost(@Req() req: Request) {
    return this.clientMetadataService.insertGrantType(req);
  }

  @Post('response-type')
  async insertResponseTypePost(@Req() req: Request) {
    return this.clientMetadataService.insertResponseType(req);
  }

  @Post('token-endpoint')
  async insertTokenEndpointAuthMethod(@Req() req: Request) {
    return this.clientMetadataService.insertTokenEndpointAuthMethod(req);
  }
}
