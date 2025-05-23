import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { concatMap, delay, interval, mergeMap, Observable, startWith, switchMap, tap } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Not, Repository } from 'typeorm';

import got from 'got';

import { EnvironmentService } from '@tamu-gisc/common/nest/environment';

import { NVPTransformer } from '../../utils/payflow.utils';
import {
  IDoExpressCheckoutPaymentResponse,
  IGetExpressCheckoutDetailsResponse,
  IPayflowCreateSubscriptionResponse,
  IPayflowExpressCheckoutPostbackResponse,
  IPayflowExpressCheckoutTokenResponse,
  IPayflowPostbackVerboseResponse,
  IPayflowRecurringProfileDetailsResponse
} from '../../interfaces/paypal/paypal-payflow.interface';
import { User } from '../../entities/user.entity';
import { Payment } from '../../entities/payment.entity';
import { Subscription } from '../../entities/subscription.entity';
import { GsvcsSubscription } from '../../interfaces/subscription/subscription.interface';

@Injectable()
export class PaymentsService {
  private _payflowUrl: string;
  private _recurringScheduler$: Observable<unknown>;

  constructor(
    private readonly env: EnvironmentService,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Subscription) private readonly subscriptions: Repository<Subscription>
  ) {
    const payflowEnvironment: string = this.env.value('payflowEnvironment');

    if (!payflowEnvironment) {
      throw new Error('Payflow environment is not set in the environment variables.');
    }

    Logger.debug(`Payflow target environment: ${payflowEnvironment}`, 'PaymentsService');

    this._payflowUrl =
      payflowEnvironment === 'live' ? 'https://payflowpro.paypal.com' : 'https://pilot-payflowpro.paypal.com';

    this._recurringScheduler$ = interval(parseInt(process.env.PAYFLOW_PROCESSING_INTERVAL, 10) || 600000).pipe(
      startWith(true),
      delay(5000),
      tap(() => {
        Logger.debug('Recurring payment scheduler triggered', 'PaymentsService');
      }),
      switchMap(() => this._collectUnprocessedSubscriptions()),
      tap((payments) => {
        Logger.debug(`Found ${payments.length} unprocessed payments`, 'PaymentsService');
      }),
      mergeMap((payments) => payments),
      concatMap((payment) => {
        return this.createSubscription(payment);
      })
    );

    this._recurringScheduler$.subscribe((res) => {
      Logger.debug(`Recurring payment processed: ${JSON.stringify(res)}`, 'PaymentsService');
    });
  }

  /**
   *
   * Initialize and generate a paypal express checkout token that will be used to guide the user to the paypal checkout page
   * The result is not a completed payment, but a verification of intent and payment source. The returned token should be used
   * to finalize payment and create a new recurring subscription
   *
   * @param {string} userGuid Value that gets passed to paypal as the COMMENT1 field. This is used to identify the user in the postback
   * @param {string} email Value that gets passed to paypal as the COMMENT2 field. This is used to identify the user in the postback
   * @return {*}
   * @memberof PaymentsService
   */
  public async initiateSecureOrder(userGuid: string, email: string) {
    if (!userGuid || !email) {
      throw new BadRequestException('User GUID and email are required to initiate a secure order.');
    }
    Logger.debug(`Initialize set express checkout (payflow)`, 'PaymentsService');
    Logger.debug(`Service URL: ${this._payflowUrl}`, 'PaymentsService');

    const form = {
      USER: this.env.value('payflowUser'),
      VENDOR: this.env.value('payflowMerchant'),
      PARTNER: this.env.value('payflowPartner'),
      PWD: this.env.value('payflowPassword'),
      TRXTYPE: 'S',
      BILLINGTYPE: 'RecurringBilling',
      TENDER: 'P',
      ACTION: 'S',
      AMT: '1.00',
      CURRENCY: 'USD',
      CUSTOM: `${userGuid}:${email}`,
      CANCELURL: 'http://localhost:4200/order/cancel',
      RETURNURL: 'http://localhost:4200/order/complete'
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

    return {
      TOKEN: deserialized.TOKEN
    };
  }

  public async getPayflowDetails(payflowTokenId: string): Promise<IPayflowPostbackVerboseResponse> {
    const form = {
      PARTNER: this.env.value('payflowPartner'),
      USER: this.env.value('payflowUser'),
      VENDOR: this.env.value('payflowMerchant'),
      PWD: this.env.value('payflowPassword'),
      TRXTYPE: 'I',
      ORIGID: payflowTokenId
      // VERBOSITY: 'HIGH',
      // ECHODATA: 'custdata'
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

  public async getExpressCheckoutDetails(expressCheckoutToken: string): Promise<IGetExpressCheckoutDetailsResponse> {
    const form = {
      USER: this.env.value('payflowUser'),
      VENDOR: this.env.value('payflowMerchant'),
      PARTNER: this.env.value('payflowPartner'),
      PWD: this.env.value('payflowPassword'),
      TRXTYPE: 'S',
      TENDER: 'P',
      ACTION: 'G',
      TOKEN: expressCheckoutToken,
      VERBOSITY: 'HIGH',
      ECHODATA: 'custdata'
    };

    const nvpString = NVPTransformer.serialize(form);

    try {
      const res = await got.post<string>(`${this._payflowUrl}`, {
        method: 'POST',
        body: nvpString
      });

      return NVPTransformer.deserialize<IGetExpressCheckoutDetailsResponse>(res.body);
    } catch (err) {
      Logger.error(`Error getting express checkout details order details: ${err}`, 'PaymentsService');
      throw new BadRequestException('Could not get express checkout details');
    }
  }

  public async capturePayment(postbackPayload: IPayflowExpressCheckoutPostbackResponse) {
    if (!postbackPayload || !postbackPayload.orderID) {
      Logger.error('Incomplete transaction received', 'PaymentsService');
      throw new BadRequestException('Incomplete transaction received');
    }

    const transaction = await this.getExpressCheckoutDetails(postbackPayload.orderID);
    const [transactionUserGuid, transactionUserEmail] = transaction.CUSTOM.split(':');

    const form = NVPTransformer.serialize({
      USER: this.env.value('payflowUser'),
      VENDOR: this.env.value('payflowMerchant'),
      PARTNER: this.env.value('payflowPartner'),
      PWD: this.env.value('payflowPassword'),
      TRXTYPE: 'S',
      TENDER: 'P',
      ACTION: 'D',
      AMT: '2.00',
      CURRENCY: 'USD',
      COMMENT1: transactionUserGuid,
      COMMENT2: transactionUserEmail,
      PAYERID: transaction.PAYERID,
      TOKEN: postbackPayload.orderID
    });

    const res = await got.post<string>(`${this._payflowUrl}`, {
      method: 'POST',
      body: form
    });

    const postedInitial = NVPTransformer.deserialize<IDoExpressCheckoutPaymentResponse>(res.body);

    // Check if the payment has already been recorded in db
    const existingPayment = await this.payments.findOne({
      where: {
        ctsTrans: postedInitial.PNREF
      }
    });

    if (existingPayment) {
      Logger.warn(`Payment already recorded for transaction ID: ${existingPayment.ctsTrans}.`, 'PaymentsService');
      return existingPayment;
    }

    // Get a user to fetch their user ID
    let user;
    const [userGuid] = transaction.CUSTOM.split(':');

    try {
      user = await this.users.findOne({
        where: {
          userGuid
        }
      });

      if (!user) {
        Logger.error(`User not found for GUID: ${userGuid}`, 'PaymentsService');
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
      payment.ctsTrans = postedInitial.PNREF;
      payment.paymentAmount = Number.parseFloat(transaction.AMT);
      payment.fromCount = 0;
      payment.toCount = 100;
      payment.numberOfRecords = 100;
      payment.numberRemaining = 100;
      payment.transactionsPerCent = payment.numberOfRecords / (payment.paymentAmount * 100);

      const savedPayment = await this.payments.save(payment);

      return savedPayment;
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

  public async createSubscription(payment: Payment) {
    Logger.debug(`Creating subscription for payment ID: ${payment.ctsTrans}`, 'PaymentsService');

    const user = await this.users.findOne({
      where: {
        userGuid: payment.userGuid
      }
    });

    if (!user) {
      Logger.error(
        `Cannot create subscription because could not find user for GUID: ${payment.userGuid}`,
        'PaymentsService'
      );
    }

    const form = {
      PARTNER: this.env.value('payflowPartner'),
      USER: this.env.value('payflowUser'),
      VENDOR: this.env.value('payflowMerchant'),
      PWD: this.env.value('payflowPassword'),
      TRXTYPE: 'R',
      TENDER: 'P',
      ACTION: 'A',
      PROFILENAME: `${user.firstName}-${user.lastName}-${user.id}`,
      ORIGID: payment.ctsTrans,
      START: '04262025',
      PAYPERIOD: 'MONT',
      AMT: Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(payment.paymentAmount),
      COMMENT1: user.userGuid
    };

    const nvpString = NVPTransformer.serialize(form);

    try {
      const res = await got.post(`${this._payflowUrl}`, {
        method: 'POST',
        body: nvpString
      });

      const deserialized = NVPTransformer.deserialize<IPayflowCreateSubscriptionResponse>(res.body);

      const subscription = new Subscription();
      subscription.userGuid = user.userGuid;
      subscription.billingPeriod = 'MONT';
      subscription.billingType = 'PrePay';
      subscription.billingAmount = payment.paymentAmount.toString();
      subscription.billingDayOfMonth = new Date().getDate().toString();
      subscription.description = 'Monthly Subscription';
      subscription.numberOfRecords = '100';
      subscription.active = true;
      subscription.recurringProfileID = deserialized.PROFILEID;
      subscription.PREF = payment.ctsTrans;
      subscription.status = 'completed';

      const savedSubscription = await this.subscriptions.save(subscription);

      if (savedSubscription) {
        Logger.debug(`Subscription saved successfully: ${savedSubscription.subscriptionGuid}`, 'PaymentsService');

        payment.note = deserialized.PROFILEID;
        payment.subscriptionGuid = savedSubscription.subscriptionGuid;
        payment.status = 'success';
        payment.active = true;

        const savedPayment = await getRepository(Payment).save(payment);

        Logger.debug(`Payment saved successfully: ${savedPayment.ctsTrans}`, 'PaymentsService');
      }

      return deserialized;
    } catch (err) {
      Logger.error(`Error creating subscription: ${err.message}`, 'PaymentsService');
    }
  }

  public getRecurringSubscriptionDetails(subscriptionId: string) {
    const form = {
      PARTNER: this.env.value('payflowPartner'),
      USER: this.env.value('payflowUser'),
      VENDOR: this.env.value('payflowMerchant'),
      PWD: this.env.value('payflowPassword'),
      TRXTYPE: 'R',
      TENDER: 'P',
      ACTION: 'I',
      ORIGPROFILEID: subscriptionId,
      VERBOSITY: 'HIGH'
    };

    const nvpString = NVPTransformer.serialize(form);

    return got
      .post(`${this._payflowUrl}`, {
        method: 'POST',
        body: nvpString
      })
      .then((res) => NVPTransformer.deserialize<IPayflowRecurringProfileDetailsResponse>(res.body))
      .catch((err) => {
        Logger.error(`Error getting subscription details: ${err.message}`, 'PaymentsService');
        throw new BadRequestException('Could not get subscription details');
      });
  }

  public getRecurringProfilePayments(profileId: string) {
    const form = {
      PARTNER: this.env.value('payflowPartner'),
      USER: this.env.value('payflowUser'),
      VENDOR: this.env.value('payflowMerchant'),
      PWD: this.env.value('payflowPassword'),
      TRXTYPE: 'R',
      TENDER: 'P',
      ACTION: 'I',
      ORIGPROFILEID: profileId,
      PAYMENTHISTORY: 'Y'
    };

    const nvpString = NVPTransformer.serialize(form);

    return got
      .post(`${this._payflowUrl}`, {
        method: 'POST',
        body: nvpString
      })
      .then((res) => NVPTransformer.deserialize<IPayflowRecurringProfileDetailsResponse>(res.body));
  }

  public deactivateRecurringSubscription(profileId: string) {
    const form = {
      PARTNER: this.env.value('payflowPartner'),
      USER: this.env.value('payflowUser'),
      VENDOR: this.env.value('payflowMerchant'),
      PWD: this.env.value('payflowPassword'),
      TRXTYPE: 'R',
      TENDER: 'P',
      ACTION: 'C',
      ORIGPROFILEID: profileId
    };

    const nvpString = NVPTransformer.serialize(form);

    return got
      .post(`${this._payflowUrl}`, {
        method: 'POST',
        body: nvpString
      })
      .then((res) => {
        return NVPTransformer.deserialize(res.body);
      });
  }

  public reactiveRecurringSubscription(profileId: string) {
    const form = {
      PARTNER: this.env.value('payflowPartner'),
      USER: this.env.value('payflowUser'),
      VENDOR: this.env.value('payflowMerchant'),
      PWD: this.env.value('payflowPassword'),
      TRXTYPE: 'R',
      TENDER: 'P',
      ACTION: 'R',
      ORIGPROFILEID: profileId
    };

    const nvpString = NVPTransformer.serialize(form);

    return got
      .post(`${this._payflowUrl}`, {
        method: 'POST',
        body: nvpString
      })
      .then((res) => {
        return NVPTransformer.deserialize(res.body);
      });
  }

  public async getSubscriptionDetailsForUser(userGuid: string): Promise<GsvcsSubscription> {
    if (process.env.LOG_LEVEL === 'verbose') {
      Logger.verbose(`Searching for existing subscription for : ${userGuid}`, 'PaymentsService');
    }

    const sub = await this.subscriptions.find({
      where: {
        userGuid,
        recurringProfileID: Not('')
      }
    });

    if (sub.length > 0) {
      const subscription = sub[0];
      const profileId = subscription.recurringProfileID;

      if (process.env.LOG_LEVEL === 'verbose') {
        Logger.verbose(`Existing subscription found. Fetching details from PayPal`, 'PaymentsService');
      }

      const details = await this.getRecurringSubscriptionDetails(profileId);

      // TODO: These are mock values. Update with valid tiers when they are coming from a database
      try {
        return {
          tier: {
            id: 'lite',
            name: 'Lite',
            description: 'Basic access to features, ideal for individuals or small teams',
            benefits: [
              {
                id: 'daily-transactions',
                name: 'Daily Transactions',
                description: 'Transactions per day',
                value: 5000,
                showcase: true
              },
              {
                id: 'rate-limit',
                name: 'Rate Limit',
                description: 'Requests per second',
                value: 15,
                showcase: true
              },
              {
                id: 'api-access',
                name: 'API Feature Access',
                description: 'API features',
                value: 'basic',
                showcase: true
              },
              {
                id: 'users',
                name: 'Users',
                description: 'Managed users',
                value: 1,
                showcase: true
              }
            ]
          },
          status: details.STATUS,
          active: details.STATUS === 'ACTIVE',
          nextPaymentDate: details.NEXTPAYMENT, // Date is in the format MMDDYYYY. Convert to ISO format
          nextPaymentDateISO: new Date(
            `${details.NEXTPAYMENT.substring(4, 8)}-${details.NEXTPAYMENT.substring(0, 2)}-${details.NEXTPAYMENT.substring(
              2,
              4
            )}`
          ).toISOString(),
          amount: details.AMT
        };
      } catch (err) {
        Logger.error(`Error getting subscription details`, 'PaymentsService');
        Logger.error(details, 'PaymentsService');
        throw new BadRequestException('Could not get subscription details');
      }
    }
  }
}
