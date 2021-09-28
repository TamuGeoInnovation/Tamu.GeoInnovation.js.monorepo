import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Token } from '@tamu-gisc/veoride/common/entities';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(Token) public repo: Repository<Token>) {}

  public validateToken(tokenId: string): Promise<Token> {
    return this.repo.findOne({
      where: {
        token: tokenId
      }
    });
  }
}
