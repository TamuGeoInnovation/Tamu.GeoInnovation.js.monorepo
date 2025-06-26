import { Component, OnInit } from '@angular/core';
import { concatMap, filter, from, map, Observable, reduce, shareReplay, startWith, Subject, switchMap } from 'rxjs';

import { PaymentsService } from '@tamu-gisc/geoservices/data-access';
import { GsvcsSubscription } from '@tamu-gisc/geoservices/data-api';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {
  public subscription: Observable<GsvcsSubscription>;
  public composedTierBenefits: Observable<string>;

  private _refresh$: Subject<void> = new Subject<void>();

  constructor(
    private readonly ps: PaymentsService,
    private readonly ms: ModalService,
    private readonly ns: NotificationService
  ) {}

  public ngOnInit(): void {
    this.subscription = this._refresh$.pipe(
      startWith(true),
      switchMap(() => {
        return this.ps.getUserSubscriptionDetails();
      }),
      shareReplay(1)
    );

    // this.composedTierBenefits = this.subscription.pipe(
    //   map((subscription) => subscription?.tier?.benefits),
    //   concatMap((benefits) =>
    //     from(benefits).pipe(
    //       filter((benefit) => benefit.showcase),
    //       reduce((acc, curr) => {
    //         return `${acc}${acc.length > 0 ? ', ' : ''}${curr.value} ${curr.description.toLowerCase()}`;
    //       }, ''),
    //       map((benefitsString) => {
    //         // Break off the last , and replace with an 'and'
    //         const lastComma = benefitsString.lastIndexOf(',');
    //         if (lastComma > -1) {
    //           return `${benefitsString.substring(0, lastComma)}, and ${benefitsString.substring(lastComma + 1)}`;
    //         }
    //         // If no comma, just return the string
    //         return benefitsString;
    //       })
    //     )
    //   ),
    //   shareReplay(1)
    // );
  }

  public openSubscriptionCancelModal(): void {
    this.ms
      .open<GsvcsSubscription, boolean>({
        title: 'Manage Subscription',
        subTitle: 'Are you sure you want to cancel your subscription?',
        context: this.subscription,
        body: (ctx) => {
          return `We're sorry to see you go! Your subscription to the **${
            ctx.tier.name
          }** tier is set to renew on *${new Date(
            ctx.nextPaymentDateISO
          ).toLocaleDateString()}*. By cancelling, you will no longer be charged at the time or renewal but will maintain all your current benefits until the end of your subscription period. If you change your mind before the end of your subscription period, you can re-activate your subscription by visiting this page again.`;
        },
        actions: {
          buttons: [
            {
              label: 'No, take me back',
              value: false,
              style: 'secondary'
            },
            {
              label: `Yes, I'm sure`,
              value: true,
              style: 'danger'
            }
          ]
        }
      })
      .subscribe((res) => {
        if (res === true) {
          // User confirmed cancellation, proceed with the cancellation
          this.ps.cancelSubscription().subscribe({
            next: () => {
              // Show success toast notification
              this.ns.toast({
                id: 'subscription-cancelled',
                title: 'Subscription Cancelled',
                message:
                  'Your subscription has been successfully cancelled. You will maintain your subscription benefits until the end of your current billing period.'
              });

              // Refresh subscription data to reflect the changes
              this._refresh$.next(null);
            },
            error: (error) => {
              // Show error toast notification
              this.ns.toast({
                id: 'subscription-cancel-error',
                title: 'Cancellation Failed',
                message:
                  'We encountered an error while cancelling your subscription. Please try again or contact support if the issue persists.'
              });
              console.error('Error cancelling subscription:', error);
            }
          });
        }
      });
  }

  public openSubscriptionReactivateModal(): void {
    this.ms
      .open<GsvcsSubscription, boolean>({
        title: 'Manage Subscription',
        subTitle: 'Are you sure you want to reactivate your subscription?',
        context: this.subscription,
        body: (ctx) => {
          return `Your subscription status is currently inactive. By reactivating your subscription, you will be charged at the time of reactivation and will regain access to all your previous benefits.`;
        },
        actions: {
          buttons: [
            {
              label: 'No, take me back',
              value: false,
              style: 'secondary'
            },
            {
              label: `Yes, I'm sure`,
              value: true,
              style: 'default'
            }
          ]
        }
      })
      .subscribe((res) => {
        if (res === true) {
          // User confirmed reactivation, proceed with the reactivation
          this.ps.reactivateSubscription().subscribe({
            next: () => {
              // Show success toast notification
              this.ns.toast({
                id: 'subscription-reactivated',
                title: 'Subscription Reactivated',
                message:
                  'Your subscription has been successfully reactivated. You will regain access to all your previous benefits.'
              });

              // Refresh subscription data to reflect the changes
              this._refresh$.next(null);
            },
            error: (error) => {
              // Show error toast notification
              this.ns.toast({
                id: 'subscription-reactivate-error',
                title: 'Reactivation Failed',
                message:
                  'We encountered an error while reactivating your subscription. Please try again or contact support if the issue persists.'
              });
              console.error('Error reactivating subscription:', error);
            }
          });
        }
      });
  }
}
