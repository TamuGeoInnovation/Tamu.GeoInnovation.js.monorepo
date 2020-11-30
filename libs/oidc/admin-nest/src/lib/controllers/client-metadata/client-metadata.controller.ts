import { Controller, Get, Param, Post, Patch, Delete, UseGuards, Body, HttpStatus, HttpException } from '@nestjs/common';

import { AdminRoleGuard } from '@tamu-gisc/oidc/client';

import { GrantType } from '../../../../../common/src/lib/entities/all.entity';
import { ClientMetadataService } from '../../../../../common/src/lib/services/client-metadata/client-metadata.service';

@UseGuards(AdminRoleGuard)
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
  public async updateExistingGrantType(@Req() req: Request) {
    return this.clientMetadataService.updateGrantType(req);
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
  public async updateResponseType(@Req() req) {
    return this.clientMetadataService.updateResponseType(req);
  }

  @Delete('response-type/delete/:responseTypeGuid')
  public async deleteResponseType(@Param() params) {
    return this.clientMetadataService.deleteResponseType(params.responseTypeGuid);
  }

  @Get('token-endpoint')
  public async allTokenEndpointAuthMethodsGet() {
    return this.clientMetadataService.getAllTokenEndpointAuthMethods();
  }

  // @Get(':clientName')
  // async oneClientGet(@Param() params) {
  //   return this.clientMetadataService.getClient(params.clientName);
  // }

  @Post('response-type')
  public async insertResponseTypePost(@Req() req: Request) {
    return this.clientMetadataService.insertResponseType(req);
  }

  @Post('token-endpoint')
  public async insertTokenEndpointAuthMethod(@Req() req: Request) {
    return this.clientMetadataService.insertTokenEndpointAuthMethod(req);
  }

  @Get('token-endpoint/:tokenEndpointAuthMethodGuid')
  public async oneTokenEndpointAuthMethod(@Param() params) {
    return this.clientMetadataService.getTokenEndpointAuthMethod(params.tokenEndpointAuthMethodGuid);
  }

  @Patch('token-endpoint/update')
  public async updateTokenEndpointAuthMethod(@Req() req) {
    return this.clientMetadataService.updateTokenEndpointAuthMethod(req);
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
    return this.clientMetadataService.getClientByGuid(params.clientMetadataGuid);
  }

  @Post()
  public async insertClientPost(@Req() req: Request) {
    return this.clientMetadataService.insertClientMetadata(req);
  }

  @Patch('update')
  public async updateClient(@Req() req) {
    return this.clientMetadataService.updateClientMetadataNew(req);
  }

  @Delete('delete/:clientMetadataGuid')
  public async deleteClientMetadata(@Param() params) {
    return this.clientMetadataService.deleteClientMetadata(params.clientMetadataGuid);
  }
}
