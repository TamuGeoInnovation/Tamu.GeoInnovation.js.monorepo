import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'tamu-gisc-research-competition',
    templateUrl: './research-competition.component.html',
    styleUrls: ['./research-competition.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterOutlet]
})
export class ResearchCompetitionComponent {}
