import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'tamu-gisc-papers',
  templateUrl: './papers.component.html',
  styleUrls: ['./papers.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink]
})
export class PapersComponent {}
