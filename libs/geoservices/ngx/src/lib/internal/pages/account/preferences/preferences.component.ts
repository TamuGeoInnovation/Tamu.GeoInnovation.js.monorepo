import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

import { AccountPreferencesService } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit {
  public form: UntypedFormGroup;

  constructor(private service: AccountPreferencesService, private fb: UntypedFormBuilder) {}

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
