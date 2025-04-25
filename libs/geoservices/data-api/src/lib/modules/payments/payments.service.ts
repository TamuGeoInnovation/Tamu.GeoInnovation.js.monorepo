import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import got from 'got';
import { v4 as guid } from 'uuid';

import { EnvironmentService } from '@tamu-gisc/common/nest/environment';

import { NVPTransformer } from '../../utils/payflow.utils';
import {
  IPayflowExpressCheckoutTokenResponse,
  IPayflowPostbackResponse,
  IPayflowPostbackVerboseResponse,
  IPayflowSecureTokenResponse
} from '../../interfaces/paypal/paypal-payflow.interface';
import { User } from '../../entities/user.entity';
import { Payment } from '../../entities/payment.entity';

@Injectable()
export class PaymentsService {
  private _payflowUrl: string;
  private _recurringScheduler$: Observable<unknown>;

  constructor(
    private readonly env: EnvironmentService,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Payment) private readonly payments: Repository<Payment>
  ) {
    const payflowEnvironment: string = this.env.value('payflowEnvironment');

    if (!payflowEnvironment) {
      throw new Error('Payflow environment is not set in the environment variables.');
    }

    Logger.debug(`Payflow target environment: ${payflowEnvironment}`, 'PaymentsService');

    this._payflowUrl =
      payflowEnvironment === 'live' ? 'https://payflowpro.paypal.com' : 'https://pilot-payflowpro.paypal.com';

    // this._recurringScheduler$ = interval(60000).pipe(
    //   startWith(true),
    //   delay(5000),
    //   switchMap(() => this._collectUnprocessedSubscriptions()),
    //   mergeMap((payments) => payments),
    //   concatMap((payment) => {
    //     return this.createSubscription(payment);
    //   })
    // );

    // this._recurringScheduler$.subscribe((res) => {
    //   Logger.debug(`Recurring payment processed: ${JSON.stringify(res)}`, 'PaymentsService');
    // });
  }

  // Example method
  public async initiateSecureOrder(userGuid: string, email: string) {
    if (!userGuid || !email) {
      throw new BadRequestException('User GUID and email are required to initiate a secure order.');
    }

    const token = guid().replace(/-/g, '');
    Logger.debug(`Initiating secure order. Fetching secure token from ${this._payflowUrl}`, 'PaymentsService');
    Logger.debug(`Secure token: ${token}`, 'PaymentsService');
    Logger.debug(`Service URL: ${this._payflowUrl}`, 'PaymentsService');

    const form = {
      USER: this.env.value('payflowUser'),
      VENDOR: this.env.value('payflowMerchant'),
      PARTNER: this.env.value('payflowPartner'),
      PWD: this.env.value('payflowPassword'),
      TRXTYPE: 'S',
      TENDER: 'P',
      ACTION: 'S',
      AMT: '1.00',
      CURRENCY: 'USD',
      COMMENT1: userGuid,
      COMMENT2: email,
      CANCELURL: 'http://localhost:4200/order/cancel',
      RETURNURL: 'http://localhost:4200/order/complete',
      ORDERDESC: 'Test Order'
    };

    const nvpString = NVPTransformer.serialize(form);

    const res = await got.post(`${this._payflowUrl}`, {
      method: 'POST',
      body: nvpString
    });

    const deserialized = NVPTransformer.deserialize<IPayflowExpressCheckoutTokenResponse>(res.body);

    if (deserialized.RESULT != '0') {
      Logger.error(`Payflow error: ${deserialized.RESPMSG}`, 'PaymentsService');
      throw new Error(deserialized.RESPMSG);
    }

    Logger.debug(`Secure token response: ${JSON.stringify(deserialized)}`, 'PaymentsService');

    return {
      TOKEN: deserialized.TOKEN
    };
  }

  public async getOrderDetails(orderId: string): Promise<IPayflowPostbackVerboseResponse> {
    const form = {
      PARTNER: this.env.value('payflowPartner'),
      USER: this.env.value('payflowUser'),
      VENDOR: this.env.value('payflowMerchant'),
      PWD: this.env.value('payflowPassword'),
      TRXTYPE: 'I',
      ORIGID: orderId,
      VERBOSITY: 'HIGH',
      ECHODATA: 'custdata'
    };

    const nvpString = NVPTransformer.serialize(form);

    try {
      const res = await got.post<string>(`${this._payflowUrl}`, {
        method: 'POST',
        body: nvpString
      });

      return NVPTransformer.deserialize<IPayflowPostbackVerboseResponse>(res.body);
    } catch (err) {
      Logger.error(`Error retrieving order details: ${err}`, 'PaymentsService');
      throw new BadRequestException('Could not retrieve order details from PayPal');
    }
  }

  public async capturePayment(postbackPayload: IPayflowPostbackResponse) {
    // The postback payload does not contain the user guid or email. We need to retrieve the transaction details with high verbosity from PayPal
    // before proceeding
    if (!postbackPayload || !postbackPayload.PNREF) {
      Logger.error('Incomplete transaction received', 'PaymentsService');
      throw new BadRequestException('Incomplete transaction received');
    }

    const transaction = await this.getOrderDetails(postbackPayload.PNREF);

    // Check if the payment has already been recorded in db
    const existingPayment = await this.payments.findOne({
      where: {
        ctsTrans: transaction.ORIGPNREF
      }
    });

    if (existingPayment) {
      Logger.warn(`Payment already recorded for transaction ID: ${transaction.PNREF}.`, 'PaymentsService');
      return existingPayment;
    }

    // Get a user to fetch their user ID
    let user;

    try {
      user = await this.users.findOne({
        where: {
          userGuid: transaction.COMMENT1
        }
      });

      if (!user) {
        Logger.error(`User not found for GUID: ${transaction.COMMENT1}`, 'PaymentsService');
        throw new BadRequestException('User not found for the provided GUID.');
      }
    } catch (err) {
      Logger.error(`Error finding user: ${err.message}`, 'PaymentsService');
      throw new BadRequestException('Could not verify user from postback payload.');
    }

    // Save the initial subscription payment

    try {
      const payment = new Payment();
      payment.UserId = user.id;
      payment.userGuid = user.userGuid;
      payment.active = false;
      payment.status = 'pending';
      payment.comment = 'OneTime Payment';
      payment.note = 'Initial subscription payment';
      payment.paymentType = 'OneTime';
      payment.firstName = transaction.FIRSTNAME;
      payment.lastName = transaction.LASTNAME;
      payment.email = transaction.EMAIL;
      payment.ctsTrans = transaction.ORIGPNREF;
      payment.paymentAmount = Number.parseFloat(transaction.AMT);
      payment.fromCount = 0;
      payment.toCount = 100;
      payment.numberOfRecords = 100;
      payment.numberRemaining = 100;
      payment.transactionsPerCent = payment.numberOfRecords / (payment.paymentAmount * 100);

      return await this.payments.save(payment);
    } catch (err) {
      Logger.error(`Error saving payment: ${err.message}`, 'PaymentsService');
      throw new BadRequestException('Could not save payment information.');
    }
  }

  private _collectUnprocessedSubscriptions() {
    try {
      return this.payments.find({
        where: {
          subscriptionGuid: null,
          status: 'pending',
          note: 'Initial subscription payment'
        }
      });
    } catch (err) {
      Logger.error(`Error collecting unprocessed subscriptions: ${err.message}`, 'PaymentsService');
      throw new BadRequestException('Could not collect unprocessed subscriptions.');
    }
  }

  public async createSubscription(payment: string) {
    // public async createSubscription(payment: Payment) {
    Logger.debug(`Creating subscription for payment ID: ${payment}`, 'PaymentsService');

    const form = {
      PARTNER: this.env.value('payflowPartner'),
      USER: this.env.value('payflowUser'),
      VENDOR: this.env.value('payflowMerchant'),
      PWD: this.env.value('payflowPassword'),
      TRXTYPE: 'R',
      TENDER: 'C',
      ACTION: 'A',
      PROFILENAME: 'TESTProfile',
      ORIGID: payment,
      START: '05252025',
      PAYPERIOD: 'MONT',
      AMT: '1.00'
      // COMMENT1: payment.userGuid,
      // COMMENT2: payment.email
    };

    const nvpString = NVPTransformer.serialize(form);

    const res = await got.post(`${this._payflowUrl}`, {
      method: 'POST',
      body: nvpString
    });

    const deserialized = NVPTransformer.deserialize<IPayflowSecureTokenResponse>(res.body);

    return { ...deserialized, origId: payment, requestString: nvpString };
  }
}
