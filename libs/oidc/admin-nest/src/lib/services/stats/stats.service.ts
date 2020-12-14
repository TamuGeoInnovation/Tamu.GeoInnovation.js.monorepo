import { Injectable } from '@nestjs/common';

import { AccessTokenRepo, UserRepo } from '@tamu-gisc/oidc/common';

@Injectable()
export class StatService {
  constructor(private readonly accessTokenRepo: AccessTokenRepo, private readonly userRepo: UserRepo) {}

  /**
   * SELECT
   *     COUNT(expiresAt)
   *     FROM [oidc-idp].[dbo].[access_tokens]
   *     WHERE [expiresAt] >= GETDATE()
   *     GROUP BY [accountGuid]
   */
  public async countOfLoggedInUsers() {
    const accessTokens = this.accessTokenRepo.createQueryBuilder('access_tokens');

    return accessTokens
      .select()
      .where('access_tokens.expiresAt >= GETDATE()')
      .groupBy('accountGuid')
      .getCount();
  }

  /**
   * SELECT
   *   COUNT(clientId) as num,
   *   clientId
   *   FROM [oidc-idp].[dbo].[access_tokens]
   *   WHERE clientId IN (SELECT DISTINCT clientId as clientIds FROM [oidc-idp].[dbo].[access_tokens] WHERE clientId IS NOT NULL)
   *   GROUP BY [clientId], [accountGuid]
   */
  public async countOfUsersByClient() {
    const ret: {
      clientNames: string[];
      clientUsers: number[];
    } = {
      clientNames: [],
      clientUsers: []
    };

    const results = await this.accessTokenRepo.query(
      'SELECT COUNT(clientId) as num, clientId FROM [oidc-idp].[dbo].[access_tokens] WHERE clientId IN (SELECT DISTINCT clientId as clientIds FROM [oidc-idp].[dbo].[access_tokens] WHERE clientId IS NOT NULL) GROUP BY clientId'
    );

    results.forEach((result) => {
      ret.clientNames.push(result.clientId);
      ret.clientUsers.push(result.num);
    });

    return ret;
  }

  /**
   * SELECT
   * [guid], [email]
   * FROM [oidc-idp].[dbo].[user]
   * WHERE added < GETDATE()
   * AND
   * added > DATEADD(DAY, -30, GETDATE())
   */
  public async countOfNewUsers() {
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
