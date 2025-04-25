import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { PaymentsService } from './payments.service';
import { IPayflowExpressCheckoutPostbackResponse } from '../../interfaces/paypal/paypal-payflow.interface';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  // @Post('order/convert')
  // public async convertToRecurring(@Body() body: { orderId: string; userGuid: string }) {
  //   return this.paymentService.createSubscription(body.orderId);
  // }

  @Post('order/callback')
  public async paypalResponseCallback(@Body() body: IPayflowExpressCheckoutPostbackResponse) {
    return this.paymentService.capturePayment(body);
  }

  @Post('order')
  public async getPayments(@Body() body: { userGuid: string; email: string }) {
    return this.paymentService.initiateSecureOrder(body.userGuid, body.email);
  }

  @Get('order/details')
  public async getOrderDetails(@Body('orderId') orderId: string) {
    return this.paymentService.getPayflowDetails(orderId);
  }

  @Delete('subscription/:profileId')
  public async cancelSubscription(@Param('profileId') profileId: string) {
    return this.paymentService.deactivateRecurringSubscription(profileId);
  }

  @Post('subscription/:profileId/activate')
  public async reactivateSubscription(@Param('profileId') profileId: string) {
    return this.paymentService.reactiveRecurringSubscription(profileId);
  }

  @Get('subscription/:profileId/details')
  public async getSubscriptionDetails(@Param('profileId') profileId: string) {
    return this.paymentService.getRecurringSubscriptionDetails(profileId);
  }

  @Get('subscription/:profileId/payments')
  public async getProfilePayments(@Param('profileId') profileId: string) {
    return this.paymentService.getRecurringProfilePayments(profileId);
  }
}
