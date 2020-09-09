import { HttpService, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AccessToken, AccessTokenRepo } from '@tamu-gisc/oidc/provider-nest';
import { map } from 'rxjs/operators';

@Injectable()
export class AccessTokenService {
  constructor(private readonly accessTokenRepo: AccessTokenRepo, private readonly httpService: HttpService) {}

  public async getAllAccessTokens() {
    const sql = this.accessTokenRepo
      .createQueryBuilder()
      .select(['clientId', 'accountGuid', 'grantId'])
      .groupBy('accountGuid, clientId, grantId')
      .execute();
    return sql;
  }

  public async revokeAccessToken(grantId: string) {
    return this.httpService.delete(`http://localhost:4001/user/access-token/${grantId}`).pipe(map((result) => result.data));
  }
}
