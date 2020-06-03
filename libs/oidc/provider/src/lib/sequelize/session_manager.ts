import { DbManager } from './DbManager';

export class SessionManager {
  public static async ensureDbIsSynced() {
    if (!DbManager.db) {
      DbManager.setup();
    }
  }

  static async getSessions() {
    return new Promise((resolve, reject) => {
      const sessions = DbManager.db.Sessions;
      sessions
        .findAll()
        .then((sns) => {
          resolve(sns);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
