import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, Subject, takeUntil } from 'rxjs';

import { SettingsInitializationConfig, SettingsService } from '@tamu-gisc/common/ngx/settings';

@Component({
  selector: 'tamu-gisc-basemap-override',
  templateUrl: './basemap-override.component.html',
  styleUrls: ['./basemap-override.component.scss']
})
export class BasemapOverrideComponent implements OnInit, OnDestroy {
  public form: UntypedFormGroup;

  private settingsConfig: SettingsInitializationConfig = {
    storage: {
      subKey: 'experiments'
    },
    settings: {
      basemap_url: {
        value: '' as string | number | boolean,
        persistent: true
      }
    }
  };

  private $destroy: Subject<void> = new Subject<void>();

  constructor(private readonly ss: SettingsService, private readonly fb: UntypedFormBuilder) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      url: ['', Validators.required]
    });

    this.ss.init(this.settingsConfig).pipe(takeUntil(this.$destroy)).subscribe((settings: any) => this.next(settings));
  }

  public ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  public next(settings: BasemapOverrideSettingsBranch) {
    const { basemap_url } = settings;

    if (basemap_url) {
      this.form.patchValue({ url: basemap_url });
    }

    const urlControl = this.form.get('url');
    if (!urlControl) {
      throw new Error('Missing url control.');
    }

    urlControl
      .valueChanges.pipe(
        takeUntil(this.$destroy),
        debounceTime(1000),
        distinctUntilChanged(),
        map((v) => {
          if (v === '') {
            return null;
          }

          return v;
        })
      )
      .subscribe((res) => {
        this.ss.updateSettings({
          basemap_url: res
        });

        location.reload();
      });
  }
}

interface BasemapOverrideSettingsBranch {
  basemap_url: string | null;
}
