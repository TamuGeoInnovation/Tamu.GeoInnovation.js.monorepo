import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Token } from '@tamu-gisc/veoride/common/entities';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(@InjectRepository(Token) public tokenRepo: Repository<Token>) {}
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const queryParams = request.query;

    if (queryParams.token === undefined) {
      return false;
    }

    const validToken = await this.tokenRepo.findOne({
      where: {
        token: queryParams.token
      }
    });

    if (validToken === undefined) {
      return false;
    }

    if (new Date() > validToken.expires) {
      return false;
    }

    return true;
  }
}
