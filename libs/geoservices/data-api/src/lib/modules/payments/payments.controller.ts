import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';

import { PaymentsService } from './payments.service';
import { IPayflowExpressCheckoutPostbackResponse } from '../../interfaces/paypal/paypal-payflow.interface';
import { LegacyAuthGuard } from '../../guards/legacy-auth/legacy-auth.guard';
import { LegacyAdminGuard } from '../../guards/legacy-admin/legacy-admin.guard';

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

  @UseGuards(LegacyAuthGuard)
  @Post('order')
  public async getPayments(@Body() body: { userGuid: string; email: string }, @Req() req: Request) {
    const user = req['user'];

    return this.paymentService.initiateSecureOrder(user.Guid, user.Email);
  }

  // Get the subscription details for the current user
  @Get('order/details')
  public async getOrderDetails(@Body('orderId') orderId: string) {
    return this.paymentService.getPayflowDetails(orderId);
  }

  // Cancel a subscription for a given profile ID
  @UseGuards(LegacyAuthGuard, LegacyAdminGuard)
  @Delete('subscription/:profileId')
  public async cancelSubscription(@Param('profileId') profileId: string) {
    return this.paymentService.deactivateRecurringSubscription(profileId);
  }

  // Reactivate a subscription for a given profile ID
  @UseGuards(LegacyAuthGuard, LegacyAdminGuard)
  @Post('subscription/:profileId/activate')
  public async reactivateSubscription(@Param('profileId') profileId: string) {
    return this.paymentService.reactiveRecurringSubscription(profileId);
  }

  // Get the subscription details for a given profile ID
  @UseGuards(LegacyAuthGuard, LegacyAdminGuard)
  @Get('subscription/:profileId/details')
  public async getSubscriptionDetails(@Param('profileId') profileId: string) {
    return this.paymentService.getRecurringSubscriptionDetails(profileId);
  }

  // Get a list of payments for a given profile ID
  @UseGuards(LegacyAuthGuard, LegacyAdminGuard)
  @Get('subscription/:profileId/payments')
  public async getProfilePayments(@Param('profileId') profileId: string) {
    return this.paymentService.getRecurringProfilePayments(profileId);
  }

  // Reactivate the subscription for the logged-in user
  @UseGuards(LegacyAuthGuard)
  @Post('subscription/activate')
  public async reactivateLoggedInUserSubscription(@Req() req: Request) {
    const user = req['user'];

    return this.paymentService.reactivateUserSubscription(user.Guid);
  }

  // Gets the active subscription for the current user
  @UseGuards(LegacyAuthGuard)
  @Get('subscription')
  public async getUserActiveSubscription(@Req() req: Request) {
    const user = req['user'];

    return this.paymentService.getSubscriptionDetailsForUser(user.Guid);
  }

  @UseGuards(LegacyAuthGuard)
  @Delete('subscription')
  public async cancelLoggedInUserSubscription(@Req() req: Request) {
    const user = req['user'];

    return this.paymentService.cancelUserSubscription(user.Guid);
  }
}
