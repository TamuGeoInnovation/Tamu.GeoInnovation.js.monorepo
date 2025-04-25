export interface IPayflowSecureTokenResponse {
  RESULT: number;
  SECURETOKEN?: string;
  SECURETOKENID?: string;
  RESPMSG: string;
}

export interface IPayflowExpressCheckoutTokenResponse {
  CORRELATIONID: string;
  RESPMSG: string;
  RESULT: string;
  TOKEN: string;
}

export interface IPayflowExpressCheckoutPostbackResponse {
  billingToken: null;
  facilitatorAccessToken: string;
  orderID: string;
  payerID: string;
  paymentID: string;
  paymentSource: string;
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

export interface IGetExpressCheckoutDetailsResponse {
  ADDRESSSTATUS: string;
  AMT: string;
  AVSADDR: string;
  AVSZIP: string;
  CORRELATIONID: string;
  COUNTRYCODE: string;
  CURRENCY: string;
  CUSTOM?: string;
  EMAIL: string;
  FIRSTNAME: string;
  LASTNAME: string;
  PAYERID: string;
  PAYERSTATUS: string;
  RESPMSG: string;
  RESULT: string;
  SHIPTOCITY: string;
  SHIPTOCOUNTRY: string;
  SHIPTONAME: string;
  SHIPTOSTATE: string;
  SHIPTOSTREET: string;
  SHIPTOZIP: string;
  TOKEN: string;
  TRANSTIME: string;
  TRXTYPE: string;
}

export interface IDoExpressCheckoutPaymentResponse {
  AVSADDR: string;
  AVSZIP: string;

  /**
   * Used to convert a transaction with billing agreement to a subscription
   */
  BAID: string;
  CORRELATIONID: string;
  FEEAMT: string;
  PAYERID: string;
  PAYMENTTYPE: string;
  PENDINGREASON: string;

  /**
   * Could be used to convert a transaction with billing agreement to a subscription
   */
  PNREF: string;
  PPREF: string;
  RESPMSG: string;
  RESULT: string;
  TOKEN: string;
  TXID: string;
}

export interface IPayflowCreateSubscriptionResponse {
  PROFILEID: string;
  RESPMSG: string;
  RESULT: string;
  RPREF: string;
}

export interface IPayflowRecurringProfileDetailsResponse {
  RESULT: string;
  RPREF: string;
  PROFILEID: string;
  STATUS: string;
  CREATIONDATE: string;
  PROFILENAME: string;
  START: string;
  TERM: string;
  NEXTPAYMENT: string;
  PAYPERIOD: string;
  LASTCHANGED: string;
  RPSTATE: string;
  NEXTPAYMENTNUM: string;
  COMMENT1: string;
  FREQUENCY: string;
  TENDER: string;
  AMT: string;
  ACCT: string;
  ABA: string;
  ACCTTYPE: string;
  AGGREGATEAMT: string;
  AGGREGATEOPTIONALAMT: string;
  MAXFAILPAYMENTS: string;
  NUMFAILPAYMENTS: string;
  RETRYNUMDAYS: string;
  EMAIL: string;
  NAME: string;
  LASTNAME: string;
  COUNTRY: string;
  SHIPTOSTREET: string;
  SHIPTOCITY: string;
  SHIPTOSTATE: string;
  SHIPTOZIP: string;
  SHIPTOCOUNTRY: string;
  BAID: string;
  CURRENCY: string;
}
