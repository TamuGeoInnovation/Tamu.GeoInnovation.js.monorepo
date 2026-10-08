import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'tamu-gisc-aggie-accessibility',
    templateUrl: './aggie-accessibility.component.html',
    styleUrls: ['./aggie-accessibility.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink]
})
export class AggieAccessibilityComponent {}
