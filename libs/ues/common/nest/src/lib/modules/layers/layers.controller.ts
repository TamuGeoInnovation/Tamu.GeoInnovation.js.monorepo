import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { AzureIdpGuard } from '@tamu-gisc/oidc/client';

import { LayersService } from './layers.service';

@Controller('layers')
export class LayersController {
  constructor(private readonly service: LayersService) {}

  @Get('')
  // @UseGuards(AzureIdpGuard)
  public getLayers() {
    return this.service.getLayers();
  }

  @Post('token')
  public updateToken(@Body() body: { token: string }) {
    return this.service.saveToken(body.token);
  }

  @Post('')
  public updateLayers(@Body() body: { layers: string }) {
    return this.service.saveLayers(body.layers);
  }
}
