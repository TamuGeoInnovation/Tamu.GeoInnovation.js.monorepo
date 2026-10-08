import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'tamu-gisc-admin-tag',
    templateUrl: './admin-tag.component.html',
    styleUrls: ['./admin-tag.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterOutlet]
})
export class AdminTagComponent {}
