import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'tamu-gisc-organizations',
    templateUrl: './organizations.component.html',
    styleUrls: ['./organizations.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterOutlet]
})
export class OrganizationsComponent {}
