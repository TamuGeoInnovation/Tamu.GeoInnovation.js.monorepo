import { Controller, Get, Param, Post, Req, Res, Patch, Delete } from '@nestjs/common';
import { Request, Response } from 'express';
import { ClientMetadata as OidcClientMetadata } from 'oidc-provider';
import { ClientMetadataService } from '../../services/client-metadata/client-metadata.service';

@Controller('client-metadata')
export class ClientMetadataController {
  constructor(private readonly clientMetadataService: ClientMetadataService) {}

  @Get('test')
  async getClientMetadataForOidcSetup() {
    const clients = await this.clientMetadataService.loadClientMetadaForOidcSetup();
    return clients;
  }

  @Get('grant')
  async allGrantTypesGet() {
    return this.clientMetadataService.getAllGrantTypes();
  }

  @Get('grant/:grantTypeGuid')
  async oneGrantTypesGet(@Param() params) {
    return this.clientMetadataService.getGrantType(params.grantTypeGuid);
  }

  @Post('grant')
  async insertGrantTypePost(@Req() req: Request) {
    return this.clientMetadataService.insertGrantType(req);
  }

  @Patch('grant/update')
  async updateExistingGrantType(@Req() req: Request) {
    return this.clientMetadataService.updateGrantType(req);
  }

  @Delete('grant/delete/:grantTypeGuid')
  async deleteGrantType(@Param() params) {
    return this.clientMetadataService.deleteGrantType(params.grantTypeGuid);
  }

  @Get('response-type')
  async allReponseTypesGet() {
    return this.clientMetadataService.getAllResponseTypes();
  }

  @Get('response-type/:responseTypeGuid')
  async oneReponseTypesGet(@Param() params) {
    return this.clientMetadataService.getResponseType(params.responseTypeGuid);
  }

  @Patch('response-type/update')
  async updateResponseType(@Req() req) {
    return this.clientMetadataService.updateResponseType(req);
  }

  @Delete('response-type/delete/:responseTypeGuid')
  async deleteResponseType(@Param() params) {
    return this.clientMetadataService.deleteResponseType(params.responseTypeGuid);
  }

  @Get('token-endpoint')
  async allTokenEndpointAuthMethodsGet() {
    return this.clientMetadataService.getAllTokenEndpointAuthMethods();
  }

  // @Get(':clientName')
  // async oneClientGet(@Param() params) {
  //   return this.clientMetadataService.getClient(params.clientName);
  // }

  @Post('response-type')
  async insertResponseTypePost(@Req() req: Request) {
    return this.clientMetadataService.insertResponseType(req);
  }

  @Post('token-endpoint')
  async insertTokenEndpointAuthMethod(@Req() req: Request) {
    return this.clientMetadataService.insertTokenEndpointAuthMethod(req);
  }

  @Get('token-endpoint/:tokenEndpointAuthMethodGuid')
  async oneTokenEndpointAuthMethod(@Param() params) {
    return this.clientMetadataService.getTokenEndpointAuthMethod(params.tokenEndpointAuthMethodGuid);
  }

  @Patch('token-endpoint/update')
  async updateTokenEndpointAuthMethod(@Req() req) {
    return this.clientMetadataService.updateTokenEndpointAuthMethod(req);
  }

  @Delete('token-endpoint/delete/:tokenEndpointAuthMethodGuid')
  async deleteTokenEndpointAuthMethod(@Param() params) {
    return this.clientMetadataService.deleteTokenEndpointAuthMethod(params.tokenEndpointAuthMethodGuid);
  }

  @Get()
  async allClientGet() {
    return this.clientMetadataService.getAllClients();
  }

  @Get(':clientMetadataGuid')
  async oneClientMetadataGet(@Param() params) {
    return this.clientMetadataService.getClientByGuid(params.clientMetadataGuid);
  }

  @Post()
  async insertClientPost(@Req() req: Request) {
    return this.clientMetadataService.insertClientMetadata(req);
  }

  @Patch('update')
  async updateClient(@Req() req) {
    return this.clientMetadataService.updateClientMetadataNew(req);
  }

  @Delete('delete/:clientMetadataGuid')
  async deleteClientMetadata(@Param() params) {
    return this.clientMetadataService.deleteClientMetadata(params.clientMetadataGuid);
  }
}
