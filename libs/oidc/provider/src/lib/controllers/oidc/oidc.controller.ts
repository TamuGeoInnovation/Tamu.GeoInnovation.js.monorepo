// assumes NestJS ^7.0.0
import { Controller, All, Req, Res, Get } from '@nestjs/common';
import { Request, Response } from 'express';

import { OidcProviderService } from '../../services/provider/provider.service';

// const callback = oidc.callback();

@Controller('oidc')
export class OidcController {
  constructor(private service: OidcProviderService) {}
  // constructor() {}

  @All('/*')
  public async mountedOidc(@Req() req, @Res() res) {
    req.url = req.originalUrl.replace('/oidc', '');
    // if (!this.service.provider) {
    //   console.log('initing');
    //   await this.service.init('http://localhost:4001');
    // }
    const callback = this.service.provider.callback();
    return callback(req, res);
    // return this.service.provider.callback();
    // return req.url;
  }
}
