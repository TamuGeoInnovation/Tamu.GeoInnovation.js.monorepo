import { Body, Controller, Get, Post } from '@nestjs/common';

import { PaymentsService } from './payments.service';
import { IPayflowPostbackResponse } from '../../interfaces/paypal/paypal-payflow.interface';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @Post('order/callback')
  public async paypalResponseCallback(@Body() body: IPayflowPostbackResponse) {
    return this.paymentService.processPayment(body);
  }

  @Post('order')
  public async getPayments(@Body() body: { userGuid: string; email: string }) {
    return this.paymentService.initiateSecureOrder(body.userGuid, body.email);
  }

  @Get('order/details')
  public async getOrderDetails(@Body('orderId') orderId: string) {
    return this.paymentService.getOrderDetails(orderId);
  }
}
