import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { sign, verify } from 'jsonwebtoken';

import { Token } from '@tamu-gisc/veoride/common/entities';
import { JWT_OPTIONS } from '../auth/symbols/jwt-options.symbol';
import { VeorideModuleRegistrationOptions } from '../../interfaces/module-registration.interface';

@Injectable()
export class TokensService {
  constructor(
    @Inject(JWT_OPTIONS) private readonly jwtOptions: VeorideModuleRegistrationOptions['jwt'],
    @InjectRepository(Token) public readonly repo: Repository<Token>
  ) {}

  /**
   * Attempts to create a jwt with the payload derived from the provided options.
   *
   * If there is a registered token with the same identity and expiration, an 422 error will be thrown.
   */
  public async createToken(options: CreateTokenDto) {
    const roundedExp = Math.round(parseInt(options.expires, 10) / 1000);
    const roundedIss = Math.round(new Date().getTime() / 1000);

    const existing = await this.findExistingToken(options.identity, roundedExp);

    if (existing) {
      throw new UnprocessableEntityException();
    }

    const token = new Token();

    token.expires = new Date(roundedExp * 1000);
    token.issued = new Date(roundedIss * 1000);
    token.identity = options.identity;

    const saved = await token.save();

    const jwt = sign(
      { iat: saved.issued.getTime() / 1000, exp: saved.expires.getTime() / 1000, sub: saved.identity, guid: saved.guid },
      this.jwtOptions.secret,
      {
        algorithm: 'HS512'
      }
    );

    return jwt;
  }

  /**
   * Verifies a token signature and returns the payload if the token is valid.
   */
  public async validateToken(token: string) {
    let verified: JwtDto;

    try {
      verified = verify(token, this.jwtOptions.secret);
    } catch (err) {
      console.log(`Invalid token: ${err.message}: ${token}`);
      return;
    }

    const t = await this.repo.findOne({
      where: {
        guid: verified.guid,
        issued: new Date(verified.iat * 1000),
        expires: new Date(verified.exp * 1000),
        identity: verified.sub
      }
    });

    if (!t) {
      return;
    }

    if (t.revoked) {
      console.log(`Token revoked: ${token}`);
      return;
    }

    return t;
  }

  /**
   * Performs a shallow check for a token with the same entity and expiration time.
   *
   * @param {string} identity Token subject
   * @param {number} expiration In seconds
   */
  public async findExistingToken(identity: string, expiration: number) {
    return this.repo.findOne({
      where: {
        identity: identity,
        expires: new Date(expiration * 1000),
        revoked: false
      }
    });
  }
}

export interface CreateTokenDto {
  expires: string;
  identity: string;
}

export interface JwtDto {
  iat: number;
  exp: number;
  sub: string;
  guid: string;
}
