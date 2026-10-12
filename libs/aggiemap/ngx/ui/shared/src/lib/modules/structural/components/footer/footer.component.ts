import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'tamu-gisc-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink]
})
export class FooterComponent {
  public year = new Date().getFullYear();
}
