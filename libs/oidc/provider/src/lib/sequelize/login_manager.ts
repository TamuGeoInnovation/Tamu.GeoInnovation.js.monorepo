import { DbManager } from './DbManager';

export class LoginManager {
  public static async ensureDbIsSynced() {
    if (!DbManager.db) {
      DbManager.setup();
    }
  }

  public static async insertNewUserLogin(grantId: string, emailUsed: string, usedIPAddress: string, sub?: string) {
    return new Promise((resolve, reject) => {
      const logins = DbManager.db.UserLogins;
      logins
        .upsert({
          sub: sub,
          grant_id: grantId,
          email_used: emailUsed,
          used_ip_addr: usedIPAddress,
          occuredAt: Date.now().toString()
        })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async getUserLoginAttempt(grantId: string) {
    return new Promise((resolve, reject) => {
      const logins = DbManager.db.UserLogins;
      logins
        .find({
          where: {
            grant_id: grantId
          }
        })
        .then((results) => {
          if (results) {
            resolve(results);
          } else {
            // do something
            resolve();
          }
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  }
}
