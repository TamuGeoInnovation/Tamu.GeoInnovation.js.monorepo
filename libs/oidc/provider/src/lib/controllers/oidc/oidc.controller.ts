// assumes NestJS ^7.0.0
import { Controller, All, Req, Res } from '@nestjs/common';

import { OidcProviderService } from '../../services/provider/provider.service';

@Controller('oidc')
export class OidcController {
  constructor(private service: OidcProviderService) {}

  @All('/*')
  public async mountedOidc(@Req() req, @Res() res) {
    req.url = req.originalUrl.replace('/oidc', '');

    const callback = this.service.provider.callback();

    return callback(req, res);
  }
}
