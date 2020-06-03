import { DbManager } from './DbManager';
import { IAdapterAttrs } from '../models/Adaptor/adapter';

export class TokenManager {
  public static async ensureDbIsSynced() {
    if (!DbManager.db) {
      DbManager.setup();
    }
  }

  public static async getAccessTokens() {
    return new Promise((resolve, reject) => {
      const access_tokens = DbManager.db.AccessTokens;
      access_tokens
        .findAll()
        .then((tokens) => {
          const result: IAdapterAttrs[] = [];
          tokens.forEach((token) => {
            result.push({
              consumedAt: token.consumedAt,
              data: token.data,
              expiresAt: token.expiresAt,
              grantId: token.grantId,
              id: token.id,
              userCode: token.userCode
            });
          });
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
