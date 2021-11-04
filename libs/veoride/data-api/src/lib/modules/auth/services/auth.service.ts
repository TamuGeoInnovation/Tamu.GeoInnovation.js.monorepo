import { Injectable } from '@nestjs/common';

import { Token } from '@tamu-gisc/veoride/common/entities';

import { TokensService } from '../../tokens/tokens.service';

@Injectable()
export class AuthService {
  constructor(private readonly tokensService: TokensService) {}

  public async validateToken(token: string): Promise<Token> {
    return this.tokensService.validateToken(token);
  }
}
