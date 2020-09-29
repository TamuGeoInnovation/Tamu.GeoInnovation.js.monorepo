import * as crypto from 'crypto';

export class SHA1HashUtils {
  /**
   * Magic number we use to append a salt to the user's password before storing in database.
   *
   * @static
   * @type {number}
   * @memberof SHA1HashUtils
   */
  static SALT_ROUNDS: number = 12;
  
  /**
   * Magic number Dan used to compute the length of the salt
   * Taken from: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.websites.gisday.tamu.edu/blob/master/src/Main/Rest/Login/Default.aspx.cs
   * @static
   * @memberof SHA1HashUtils
   */
  static OLD_SALT_LENGTH = 5;

  /**
   * Determines the length of the salt
   * Taken from: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.Common.Core.Utils/blob/master/Src/Main/Base64Converters/Base64Converter.cs
   * @static
   * @param {number} base64Length
   * @returns {Promise<number>}
   * @memberof SHA1HashUtils
   */
  static getSaltLength(base64Length: number = this.OLD_SALT_LENGTH): Promise<number> {
    return new Promise((resolve, reject) => {
      const buff = Buffer.alloc(base64Length);
      const s = buff.toString('base64').toUpperCase();
      return resolve(s.length);
    });
  }

  /**
   * Returns the salt string taken from a hashed password
   *
   * @static
   * @param {string} hash
   * @returns {Promise<string>}
   * @memberof SHA1HashUtils
   */
  static getSaltFromSHA1Hash(hash: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.getSaltLength().then((saltLen) => {
        const hashLen = hash.length;
        return resolve(hash.substr(hashLen - saltLen, saltLen));
      });
    });
  }

  /**
   *
   * Generates a SH1 hash given a password and salt
   * @static
   * @param {string} password
   * @param {string} salt
   * @returns {Promise<boolean>}
   * @memberof SHA1HashUtils
   */
  static generateSH1Hash(password: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha1');
      const data = hash.update(password.concat(salt), 'utf8');
      const genHash = data
        .digest('hex')
        .concat(salt)
        .toUpperCase();
      return resolve(genHash);
    });
  }

  static compareTwoHashes(hash1: string, hash2: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return resolve(hash1 === hash2);
    });
  }
}

// const buff = Buffer.alloc(5);
// const s = buff.toString('base64').toUpperCase();
// console.log(s, "length: ", s.length)

// const salts: string[] = ["6DK9KSK="];
// salts.map((val, index) => {
//   const hash = crypto.createHash('sha1');
//   const data = hash.update(password.concat(val), 'utf8');
//   const genHash = data.digest('hex').toUpperCase().concat(val);
//   console.log('hash', genHash);
//   console.log('same?', '815134D02914B43528CA7F684D1B765830DA34D56DK9KSK=' === genHash)
// })
