import { Injectable, Logger } from '@nestjs/common';

import got from 'got';
import { v4 as guid } from 'uuid';

import { EnvironmentService } from '@tamu-gisc/common/nest/environment';

import { NVPTransformer } from '../../utils/payflow.utils';

@Injectable()
export class PaymentsService {
  private _payflowUrl: string;

  constructor(private readonly env: EnvironmentService) {
    const payflowEnvironment: string = this.env.value('payflowEnvironment');

    if (!payflowEnvironment) {
      throw new Error('Payflow environment is not set in the environment variables.');
    }

    Logger.debug(`Payflow target environment: ${payflowEnvironment}`, 'PaymentsService');

    this._payflowUrl =
      payflowEnvironment === 'live' ? 'https://payflowpro.paypal.com' : 'https://pilot-payflowpro.paypal.com';
  }

  // Example method
  public async initiateSecureOrder() {
    Logger.debug(`Initiating secure order. Fetching secure token from ${this._payflowUrl}`, 'PaymentsService');
    const token = guid().replace(/-/g, '');
    Logger.debug(`Secure token: ${token}`, 'PaymentsService');

    const form = {
      PARTNER: this.env.value('payflowPartner'),
      USER: this.env.value('payflowUser'),
      VENDOR: this.env.value('payflowMerchant'),
      PWD: this.env.value('payflowPassword'),
      TRXTYPE: 'S',
      AMT: '24.35',
      CURRENCY: 'USD',
      CREATESECURETOKEN: 'Y',
      SECURETOKENID: token,
      TENDER: 'C'
    };

    const nvpString = NVPTransformer.serialize(form);

    const res = await got.post(`${this._payflowUrl}`, {
      method: 'POST',
      body: nvpString
    });

    const deserialized = NVPTransformer.deserialize<IPayflowSecureTokenResponse>(res.body);

    if (deserialized.RESULT != 0) {
      Logger.error(`Payflow error: ${deserialized.RESPMSG}`, 'PaymentsService');
      throw new Error(deserialized.RESPMSG);
    }

    Logger.debug(`Secure token response: ${JSON.stringify(deserialized)}`, 'PaymentsService');

    return {
      SECURETOKEN: deserialized.SECURETOKEN,
      SECURETOKENID: deserialized.SECURETOKENID
    };
  }
}

export interface IPayflowSecureTokenResponse {
  RESULT: number;
  SECURETOKEN?: string;
  SECURETOKENID?: string;
  RESPMSG: string;
}
