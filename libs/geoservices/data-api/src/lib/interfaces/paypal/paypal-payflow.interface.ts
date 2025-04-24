export interface IPayflowSecureTokenResponse {
  RESULT: number;
  SECURETOKEN?: string;
  SECURETOKENID?: string;
  RESPMSG: string;
}

export interface IPayflowPostbackResponse {
  BILLTOCOUNTRY: string;
  AVSADDR: string;
  TRANSTIME: string;
  TAX: string;
  FIRSTNAME: string;
  EMAIL: string;
  COUNTRYTOSHIP: string;
  AVSZIP: string;
  STATETOSHIP: string;
  SECURETOKENID: string;
  AVSDATA: string;
  TENDER: string;
  COUNTRY: string;
  LASTNAME: string;
  SHIPTOSTATE: string;
  CORRELATIONID: string;
  TYPE: string;
  TOKEN: string;
  FEEAMT: string;
  SHIPTOZIP: string;
  BILLTOFIRSTNAME: string;
  ADDRESSTOSHIP: string;
  CITYTOSHIP: string;
  NAMETOSHIP: string;
  SECURETOKEN: string;
  SHIPTOCITY: string;
  RESPMSG: string;
  BILLTOEMAIL: string;
  AMT: string;
  TRXTYPE: string;
  SHIPTOSTREET: string;
  PENDINGREASON: string;
  NAME: string;
  SHIPTOCOUNTRY: string;
  PAYMENTTYPE: string;
  PAYERID: string;
  ZIPTOSHIP: string;
  BILLTONAME: string;
  TXID: string;
  METHOD: string;
  PNREF: string;
  BILLTOLASTNAME: string;
  RESULT: string;
  PPREF: string;
}

export interface IPayflowPostbackVerboseResponse extends IPayflowPostbackResponse {
  /**
   * User Guid
   */
  COMMENT1: string;

  /**
   * User email
   */
  COMMENT2: string;

  ORIGPNREF?: string;
}
