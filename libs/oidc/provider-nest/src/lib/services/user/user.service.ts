import { Connection, getConnection, Repository, Db, UpdateResult } from 'typeorm';
import { SHA1HashUtils } from '../../_utils/sha1hash.util';
import { Account, User, UserRepo, AccountRepo } from '../../entities/all.entity';

import { hash, compare } from 'bcrypt';
import { Injectable } from '@nestjs/common';

// export class UserService {
//   public static async insertUser(user: User): Promise<boolean> {
//     return new Promise((resolve, reject) => {
//       getConnection()
//         .getRepository(User)
//         .findOne({
//           email: user.email
//         })
//         .then((existingUser) => {
//           if (existingUser) {
//             console.log('User already exists with this email');
//             resolve(false);
//           } else {
//             hash(user.password, SHA1HashUtils.SALT_ROUNDS).then((hashedPw) => {
//               user.password = hashedPw;
//               getConnection()
//                 .getRepository(User)
//                 .save(user)
//                 .then((val) => {
//                   resolve(true);
//                 })
//                 .catch((err) => {
//                   reject(err);
//                 });
//             });
//           }
//         })
//         .catch((err) => {
//           throw err;
//         });
//     });
//   }

//   public static async userLogin(email: string, password: string): Promise<User> {
//     return new Promise((resolve, reject) => {
//       getConnection()
//         .getRepository(User)
//         .createQueryBuilder('user')
//         .leftJoinAndSelect('user.account', 'account')
//         .where('user.email = :email', { email })
//         .getOne()
//         .then((user: User) => {
//           if (user) {
//             compare(password, user.password).then((same) => {
//               if (same) {
//                 resolve(user);
//               } else {
//                 resolve();
//               }
//             });
//           } else {
//             // no user found
//             reject();
//           }
//         });
//     });
//   }

//   public static async updateUser(user: User): Promise<UpdateResult> {
//     return new Promise((resolve, reject) => {
//       getConnection()
//         .getRepository(User)
//         .createQueryBuilder()
//         .update(user)
//         .execute()
//         .then((result) => {
//           resolve(result);
//         })
//         .catch((err) => {
//           throw err;
//         });
//     });
//   }
// }

@Injectable()
export class UserService {
  constructor(public readonly userRepo: UserRepo, public readonly accountRepo: AccountRepo) {}

  public async insertUser(user: User) {
    const existingUser = await this.userRepo.findOne({
      where: {
        email: user.email
      }
    });

    if (existingUser) {
      // user already exists, do something about it
    }

    user.password = await hash(user.password, SHA1HashUtils.SALT_ROUNDS);
    return this.userRepo.save(user);
  }

  public async userLogin(email: string, password: string) {
    const userWithAccount = await this.userRepo.findByKeyDeep('email', email);
    if (userWithAccount) {
      const same = await compare(password, userWithAccount.password);
      if (same) {
        return userWithAccount;
      } else {
        return null;
      }
    }
  }

  // public async insertAccount(account: Account) {
  //   const existingAccount = await this.accountRepo.findOne({
  //     where: {
  //       email: account.email
  //     }
  //   })
  // }
}
