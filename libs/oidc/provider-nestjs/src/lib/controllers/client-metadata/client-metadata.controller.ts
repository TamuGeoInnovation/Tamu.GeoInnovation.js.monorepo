import { Controller, Get, HttpException, Param, Post, HttpStatus, Body } from '@nestjs/common';

import { ClientMetadata, GrantType, ResponseType, TokenEndpointAuthMethod } from '../../entities/all.entity';
import { ClientMetadataService } from '../../services/client-metadata/client-metadata.service';

@Controller('client-metadata')
export class ClientMetadataController {
  constructor(private readonly clientMetadataService: ClientMetadataService) {}

  @Get()
  public async allClientGet() {
    return this.clientMetadataService.getAllClients();
  }

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
  public async insertClientPost(@Body() body) {
    try {
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
    } catch (err) {
      throw new HttpException(err, HttpStatus.PARTIAL_CONTENT);
    }
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

  @Post('response-type')
  public async insertResponseTypePost(@Body() body) {
    try {
      const _responseType: Partial<ResponseType> = {
        type: body.type,
        details: body.details
      };

      return this.clientMetadataService.insertResponseType(_responseType);
    } catch (err) {
      throw new HttpException(err, HttpStatus.PARTIAL_CONTENT);
    }
  }

  @Post('token-endpoint')
  public async insertTokenEndpointAuthMethod(@Body() body) {
    try {
      const _tokenEndpointMethod: Partial<TokenEndpointAuthMethod> = {
        type: body.type,
        details: body.details
      };

      return this.clientMetadataService.insertTokenEndpointAuthMethod(_tokenEndpointMethod);
    } catch (err) {
      throw new HttpException(err, HttpStatus.PARTIAL_CONTENT);
    }
  }
}
