import { Body, Controller, Get, Logger, NotImplementedException, Post } from '@nestjs/common';

import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @Post('order')
  public async getPayments(@Body() body: { userGuid: string; email: string }) {
    return this.paymentService.initiateSecureOrder(body.userGuid, body.email);
  }

  @Get('order/details')
  public async getOrderDetails(@Body('orderId') orderId: string) {
    return this.paymentService.getOrderDetails(orderId);
  }
}
