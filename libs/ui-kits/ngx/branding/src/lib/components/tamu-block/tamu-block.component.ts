import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'tamu-gisc-tamu-block',
    templateUrl: './tamu-block.component.html',
    styleUrls: ['./tamu-block.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink]
})
export class TamuBlockBrandingComponent {}
