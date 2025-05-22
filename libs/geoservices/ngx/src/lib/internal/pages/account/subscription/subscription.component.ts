import { Component, OnInit } from '@angular/core';
import { concatMap, filter, map, Observable, reduce, shareReplay } from 'rxjs';

import { PaymentsService } from '@tamu-gisc/geoservices/data-access';
import { GsvcsSubscription } from '@tamu-gisc/geoservices/data-api';

@Component({
  selector: 'tamu-gisc-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {
  public subscription: Observable<GsvcsSubscription>;
  public composedTierBenefits: Observable<string>;

  constructor(private readonly ps: PaymentsService) {}

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
}
