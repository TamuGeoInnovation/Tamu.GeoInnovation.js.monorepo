import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'tamu-gisc-recurring-billing-policy',
    templateUrl: './recurring-billing-policy.component.html',
    styleUrls: ['./recurring-billing-policy.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink]
})
export class RecurringBillingPolicyComponent {}
