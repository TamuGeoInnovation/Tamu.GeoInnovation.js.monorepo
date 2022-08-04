import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, Subject, takeUntil } from 'rxjs';

import { SettingsInitializationConfig, SettingsService } from '@tamu-gisc/common/ngx/settings';

@Component({
  selector: 'tamu-gisc-basemap-override',
  templateUrl: './basemap-override.component.html',
  styleUrls: ['./basemap-override.component.scss']
})
export class BasemapOverrideComponent implements OnInit, OnDestroy {
  public form: FormGroup;

  private settingsConfig: SettingsInitializationConfig = {
    storage: {
      subKey: 'experiments'
    },
    settings: {
      basemap_url: {
        value: null,
        persistent: true
      }
    }
  };

  private $destroy: Subject<boolean> = new Subject();

  constructor(private readonly ss: SettingsService, private readonly fb: FormBuilder) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      url: ['', Validators.required]
    });

    this.ss.init(this.settingsConfig).pipe(takeUntil(this.$destroy)).subscribe(this.next.bind(this));
  }

  public ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.complete();
  }

  public next(settings: BasemapOverrideSettingsBranch) {
    const { basemap_url } = settings;

    if (basemap_url) {
      this.form.patchValue({ url: basemap_url });
    }

    this.form
      .get('url')
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
