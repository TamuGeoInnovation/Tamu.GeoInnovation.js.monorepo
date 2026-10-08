import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FooterShortcutsComponent } from './shortcuts/shortcuts.component';
import { FooterLegalComponent } from './legal/legal.component';
import { ReleaseInfoComponent } from './release-info/release-info.component';

@Component({
  selector: 'tamu-gisc-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FooterShortcutsComponent, FooterLegalComponent, ReleaseInfoComponent]
})
export class FooterComponent {}
