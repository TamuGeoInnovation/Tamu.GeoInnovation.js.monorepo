import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AccountPreferencesService } from '@tamu-gisc/geoservices/data-access';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';

@Component({
  selector: 'tamu-gisc-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, ReactiveFormsModule, CheckboxComponent]
})
export class PreferencesComponent implements OnInit {
  private service = inject(AccountPreferencesService);
  private fb = inject(UntypedFormBuilder);

  public form: UntypedFormGroup;

  public ngOnInit() {
    this.form = this.fb.group({
      NewsUpdates: [false],
      ServiceUpdates: [false],
      ServiceOutages: [false]
    });

    this.service.getNotificationPreferences().subscribe((res) => {
      this.form.patchValue(res);

      this.form.valueChanges.subscribe(() => {
        const prefs = this.form.getRawValue();

        this.service.updateNotificationPreferences(prefs).subscribe(() => {
          console.log('Updated preferences.');
        });
      });
    });
  }
}
