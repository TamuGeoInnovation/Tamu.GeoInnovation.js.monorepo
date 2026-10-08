import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContactFormComponent } from '../../../../../core/modules/forms/contact-form/contact-form.component';

@Component({
  selector: 'tamu-gisc-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ContactFormComponent]
})
export class ContactUsComponent {}
