import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'tamu-gisc-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class FooterComponent {
  public year = new Date().getFullYear();
}
