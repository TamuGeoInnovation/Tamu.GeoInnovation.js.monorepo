import { Controller, Get } from '@nestjs/common';

import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @Get('order')
  public async getPayments() {
    return this.paymentService.initiateSecureOrder();
  }
}
