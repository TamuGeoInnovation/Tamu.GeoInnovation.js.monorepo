import { Injectable } from '@nestjs/common';
import { AccessToken, AccessTokenRepo, UserRepo } from '../../entities/all.entity';
import { access } from 'fs';

@Injectable()
export class StatService {
  constructor(private readonly accessTokenRepo: AccessTokenRepo, private readonly userRepo: UserRepo) {}

  public async countOfLoggedInUsers() {
    /*  SELECT
      COUNT(expiresAt)
      FROM [oidc-idp].[dbo].[access_tokens]
      WHERE [expiresAt] >= GETDATE()
    */
    const accessTokens = this.accessTokenRepo.createQueryBuilder('access_tokens');
    return accessTokens
      .select()
      .where('access_tokens.expiresAt >= GETDATE()')
      .getCount();
  }

  public async countOfUsersByClient() {
    /*
        SELECT
        COUNT(clientId) as num,
        clientId
        FROM [oidc-idp].[dbo].[access_tokens]
        WHERE clientId IN (SELECT DISTINCT clientId as clientIds FROM [oidc-idp].[dbo].[access_tokens] WHERE clientId IS NOT NULL)
        GROUP BY clientId
    */
    return this.accessTokenRepo.query(
      'SELECT COUNT(clientId) as num, clientId FROM [oidc-idp].[dbo].[access_tokens] WHERE clientId IN (SELECT DISTINCT clientId as clientIds FROM [oidc-idp].[dbo].[access_tokens] WHERE clientId IS NOT NULL) GROUP BY clientId'
    );
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
