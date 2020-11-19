import { Controller, Get, Param, Post, Req, Res } from '@nestjs/common';

import { Request } from 'express';

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
    return this.clientMetadataService.insertClientMetadata(req);
  }

  @Post('grant')
  public async insertGrantTypePost(@Req() req: Request) {
    return this.clientMetadataService.insertGrantType(req);
  }

  @Post('response-type')
  public async insertResponseTypePost(@Req() req: Request) {
    return this.clientMetadataService.insertResponseType(req);
  }

  @Post('token-endpoint')
  public async insertTokenEndpointAuthMethod(@Req() req: Request) {
    return this.clientMetadataService.insertTokenEndpointAuthMethod(req);
  }
}
