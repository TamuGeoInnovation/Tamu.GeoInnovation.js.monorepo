import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { AccountPreferencesService } from '@tamu-gisc/geoservices/modules/data-access';

@Component({
  selector: 'tamu-gisc-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit {
  public form: FormGroup;

  constructor(private service: AccountPreferencesService, private fb: FormBuilder) {}

  public ngOnInit() {
    this.form = this.fb.group({
      NewsUpdates: [false],
      ServiceUpdates: [false],
      ServiceOutages: [false]
    });

    this.service.getNotificationPreferences().subscribe((res) => {
      this.form.patchValue(res);

      this.form.valueChanges.subscribe((changes) => {
        const prefs = this.form.getRawValue();

        this.service.updateNotificationPreferences(prefs).subscribe((result) => {
          console.log('Updated preferences.');
        });
      });
    });
  }
}
