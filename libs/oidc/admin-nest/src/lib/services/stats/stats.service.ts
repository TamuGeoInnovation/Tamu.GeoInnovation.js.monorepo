import { Injectable } from '@nestjs/common';
import { AccessToken, AccessTokenRepo, UserRepo } from '@tamu-gisc/oidc/provider-nest';
import { access } from 'fs';

@Injectable()
export class StatService {
  constructor(private readonly accessTokenRepo: AccessTokenRepo, private readonly userRepo: UserRepo) {}

  public async countOfLoggedInUsers() {
    /*  SELECT
      COUNT(expiresAt)
      FROM [oidc-idp].[dbo].[access_tokens]
      WHERE [expiresAt] >= GETDATE()
      GROUP BY [accountGuid]
    */
    const accessTokens = this.accessTokenRepo.createQueryBuilder('access_tokens');
    return accessTokens
      .select()
      .where('access_tokens.expiresAt >= GETDATE()')
      .groupBy('accountGuid')
      .getCount();
  }

  public async countOfUsersByClient() {
    const ret: {
      clientNames: string[];
      clientUsers: number[];
    } = {
      clientNames: [],
      clientUsers: []
    };
    /*
        SELECT
        COUNT(clientId) as num,
        clientId
        FROM [oidc-idp].[dbo].[access_tokens]
        WHERE clientId IN (SELECT DISTINCT clientId as clientIds FROM [oidc-idp].[dbo].[access_tokens] WHERE clientId IS NOT NULL)
        GROUP BY [clientId], [accountGuid]
    */
    const results = await this.accessTokenRepo.query(
      'SELECT COUNT(clientId) as num, clientId FROM [oidc-idp].[dbo].[access_tokens] WHERE clientId IN (SELECT DISTINCT clientId as clientIds FROM [oidc-idp].[dbo].[access_tokens] WHERE clientId IS NOT NULL) GROUP BY clientId'
    );
    results.forEach((result) => {
      ret.clientNames.push(result.clientId);
      ret.clientUsers.push(result.num);
    });

    return ret;
  }

  public async countOfNewUsers() {
    /*
        SELECT
        [guid], [email]
        FROM [oidc-idp].[dbo].[user]
        WHERE added < GETDATE()
        AND
        added > DATEADD(DAY, -30, GETDATE())
      */
    return this.userRepo.query(
      'SELECT [guid], [email] FROM [oidc-idp].[dbo].[user] WHERE added < GETDATE() AND added > DATEADD(DAY, -30, GETDATE())'
    );
  }

  public async totalLoginsPastMonth() {
    return this.accessTokenRepo.query(
      'SELECT [grantId],[clientId] FROM [oidc-idp].[dbo].[access_tokens] WHERE added < GETDATE() AND added > DATEADD(DAY, -30, GETDATE())'
    );
  }
}
