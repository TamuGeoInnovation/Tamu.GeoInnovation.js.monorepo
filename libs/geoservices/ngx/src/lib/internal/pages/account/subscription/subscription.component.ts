import { Component, OnInit } from '@angular/core';
import { concatMap, filter, map, Observable, reduce, shareReplay } from 'rxjs';

import { PaymentsService } from '@tamu-gisc/geoservices/data-access';
import { GsvcsSubscription } from '@tamu-gisc/geoservices/data-api';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

@Component({
  selector: 'tamu-gisc-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {
  public subscription: Observable<GsvcsSubscription>;
  public composedTierBenefits: Observable<string>;

  constructor(private readonly ps: PaymentsService, private readonly ms: ModalService) {}

  public ngOnInit(): void {
    this.subscription = this.ps.getUserSubscriptionDetails().pipe(shareReplay(1));
    this.composedTierBenefits = this.subscription.pipe(
      map((subscription) => subscription?.tier?.benefits),
      concatMap((benefits) => benefits),
      filter((benefit) => benefit.showcase),
      reduce((acc, curr) => {
        return `${acc}${acc.length > 0 ? ', ' : ''}${curr.value} ${curr.description.toLowerCase()}`;
      }, ''),
      map((benefitsString) => {
        // Break off the last , and replace with an 'and'
        const lastComma = benefitsString.lastIndexOf(',');
        if (lastComma > -1) {
          return `${benefitsString.substring(0, lastComma)}, and ${benefitsString.substring(lastComma + 1)}`;
        }
        // If no comma, just return the string
        return benefitsString;
      }),
      shareReplay(1)
    );
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
        console.log(res);
      });
  }
}
