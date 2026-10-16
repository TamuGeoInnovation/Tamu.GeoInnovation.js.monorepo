import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * How to pay for a sponsorship, in the Texas A&M Foundation's words (#1829). Sponsorships have fair
 * market values, so they are not paid through the Foundation's giving site, whose receipt says the
 * giver receives nothing in return.
 */
@Component({
  selector: 'tamu-gisc-sponsors-payment',
  templateUrl: './sponsors-payment.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink]
})
export class SponsorsPaymentComponent {}
