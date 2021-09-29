import { Body, Controller, Post } from '@nestjs/common';

import { CreateTokenDto, TokensService } from './tokens.service';

@Controller('tokens')
export class TokensController {
  constructor(private service: TokensService) {}

  @Post('')
  public async createToken(@Body() params: CreateTokenDto) {
    const token = await this.service.createToken({ expires: params.expires, identity: params.identity });

    return {
      token
    };
  }
}
