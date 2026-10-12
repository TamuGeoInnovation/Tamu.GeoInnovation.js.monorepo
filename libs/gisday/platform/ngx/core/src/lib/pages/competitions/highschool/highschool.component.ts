import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'tamu-gisc-highschool',
  templateUrl: './highschool.component.html',
  styleUrls: ['./highschool.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink]
})
export class HighschoolComponent {}
