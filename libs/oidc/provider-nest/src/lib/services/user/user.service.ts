import { Connection, getConnection, Repository, Db, UpdateResult } from 'typeorm';
import { CommonService } from '../common/common.service';
import { SHA1HashUtils } from '../../_utils/sha1hash.util';
import { User } from '../../entities/all.entity';

import { hash, compare } from 'bcrypt';

export class UserService extends CommonService {
  private static connection: Connection;
  private static repository: Repository<User>;

  // public static async findUserByKey(key: string, value: string): Promise<User> {
  //   return new Promise((resolve, reject) => {
  //     const op = {
  //       [key]: value
  //     };
  //     getConnection()
  //       .getRepository(User)
  //       .createQueryBuilder('user')
  //       .where(`user.${key} = :${key}`, op)
  //       .getOne()
  //       .then((user: User) => {
  //         resolve(user);
  //       })
  //       .catch((err) => {
  //         throw err;
  //       });
  //   });
  // }

  public static async insertUser(user: User): Promise<boolean> {
    return new Promise((resolve, reject) => {
      getConnection()
        .getRepository(User)
        .findOne({
          email: user.email
        })
        .then((existingUser) => {
          if (existingUser) {
            console.log('User already exists with this email');
            resolve(false);
          } else {
            hash(user.password, SHA1HashUtils.SALT_ROUNDS).then((hashedPw) => {
              user.password = hashedPw;
              getConnection()
                .getRepository(User)
                .save(user)
                .then((val) => {
                  resolve(true);
                })
                .catch((err) => {
                  reject(err);
                });
            });
          }
        })
        .catch((err) => {
          throw err;
        });
    });
  }

  public static async userLogin(email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      getConnection()
        .getRepository(User)
        .createQueryBuilder('user')
        .leftJoinAndSelect("user.account", "account")
        .where('user.email = :email', { email })
        .getOne()
        .then((user: User) => {
          if (user) {
            compare(password, user.password).then((same) => {
              if (same) {
                resolve(user);
              } else {
                resolve();
              }
            });
          } else {
            // no user found
            reject();
          }
        });
    });
  }

  public static async updateUser(user: User): Promise<UpdateResult> {
    return new Promise((resolve, reject) => {
      getConnection()
        .getRepository(User)
        .createQueryBuilder()
        .update(user)
        .execute()
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          throw err;
        });
    });
  }
}
