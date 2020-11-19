import * as crypto from 'crypto';

export class SHA1HashUtils {
  /**
   * Magic number we use to append a salt to the user's password before storing in database.
   *
   * @type {number}
   */
  public static SALT_ROUNDS = 12;

  /**
   * Magic number Dan used to compute the length of the salt
   * Taken from: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.websites.gisday.tamu.edu/blob/master/src/Main/Rest/Login/Default.aspx.cs
   */
  public static OLD_SALT_LENGTH = 5;

  /**
   * Determines the length of the salt
   * Taken from: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.Common.Core.Utils/blob/master/Src/Main/Base64Converters/Base64Converter.cs
   * @param {number} base64Length
   * @returns {Promise<number>}
   */
  public static async getSaltLength(base64Length: number = this.OLD_SALT_LENGTH) {
    const buff = Buffer.alloc(base64Length);
    const s = buff.toString('base64').toUpperCase();
    return s.length;
  }

  /**
   * Returns the salt string taken from a hashed password
   *
   * @param {string} hash
   * @returns {Promise<string>}
   */
  public static async getSaltFromSHA1Hash(hash: string) {
    return this.getSaltLength().then((saltLen) => {
      const hashLen = hash.length;
      return hash.substr(hashLen - saltLen, saltLen);
    });
  }

  /**
   *
   * Generates a SH1 hash given a password and salt
   * @param {string} password
   * @param {string} salt
   * @returns {Promise<boolean>}
   */
  public static async generateSH1Hash(password: string, salt: string) {
    const hash = crypto.createHash('sha1');
    const data = hash.update(password.concat(salt), 'utf8');
    const genHash = data
      .digest('hex')
      .concat(salt)
      .toUpperCase();
    return genHash;
  }

  public static compareTwoHashes(hash1: string, hash2: string) {
    return hash1 === hash2;
  }
}
