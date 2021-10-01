import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { BearerGuard } from '../auth/guards/bearer-guard/bearer-guard.guard';
import { CreateTokenDto, TokensService } from './tokens.service';

@Controller('tokens')
export class TokensController {
  constructor(private service: TokensService) {}

  @Post('')
  @UseGuards(BearerGuard)
  public async createToken(@Body() params: CreateTokenDto) {
    const token = await this.service.createToken({ expires: params.expires, identity: params.identity });

    return {
      token
    };
  }
}
