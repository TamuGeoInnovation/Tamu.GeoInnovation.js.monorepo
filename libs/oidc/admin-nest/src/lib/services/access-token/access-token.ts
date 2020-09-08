import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AccessToken, AccessTokenRepo } from '@tamu-gisc/oidc/provider-nest';

@Injectable()
export class AccessTokenService {
  constructor(private readonly accessTokenRepo: AccessTokenRepo) {}

  public async getAllAccessTokens() {
    return this.accessTokenRepo.find();
  }
}
