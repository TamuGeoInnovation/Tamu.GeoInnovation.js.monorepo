import { Connection, getConnection, Repository } from "typeorm";
import { Account } from "../../entities/all.entity";
import { CommonService } from "../common/common.service";

export class AccountService extends CommonService {
  private static connection: Connection;
  private static repository: Repository<Account>;

  public static async insertAccount(account: Account): Promise<boolean> {
    return new Promise((resolve, reject) => {
      getConnection()
      .getRepository(Account)
      .findOne({
        email: account.email
      })
      .then(existingAccount => {
        if (existingAccount) {
          console.log("Account with this email already exists");
          resolve(false);
        } else {
          getConnection()
            .getRepository(Account)
            .save(account)
            .then(val => {
              resolve(true);
            })
            .catch(err => {
              reject(err);
            })
        }
      })
    });
  }

  public static async findUser() {}
}
