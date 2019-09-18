import { async, TestBed } from '@angular/core/testing';
import { SettingsService } from './common-ngx-settings.service';
import { CommonModule } from '@angular/common';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';

describe('SettingsService', () => {
  beforeEach(async(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, SettingsModule]
    }).compileComponents();
  }));

  it('should create', () => {
    const service: SettingsService = TestBed.get(SettingsService);
    expect(service).toBeDefined();
  });

  it('should filter persistent compound settings', () => {
    const service: SettingsService = TestBed.get(SettingsService);
    expect(
      (service as any).getPersistentCompoundSettings({
        no: {
          storage: {},
          persistent: false
        },
        maybe: {
          storage: {}
        },
        yes: {
          storage: {},
          persistent: true
        }
      })
    ).toEqual({
      yes: {
        storage: {},
        persistent: true
      }
    });
  });

  it('should filter persistent compound settings keys', () => {
    const service: SettingsService = TestBed.get(SettingsService);
    expect(
      (service as any).getPersistentCompoundSettingsKeys({
        no: {
          storage: {},
          persistent: false
        },
        maybe: {
          storage: {}
        },
        yes: {
          storage: {},
          persistent: true
        }
      })
    ).toEqual(['yes']);
  });

  it('should reduce compound to simple settings branch', () => {
    const service: SettingsService = TestBed.get(SettingsService);
    expect(
      (service as any).compoundToSimpleSettingsBranch({
        bf: {
          storage: {},
          value: false
        },
        bt: {
          storage: {},
          value: true
        },
        s: {
          storage: {},
          value: 'string'
        },
        ni: {
          storage: {},
          value: 1
        },
        nf: {
          storage: {},
          value: 0.5
        }
      })
    ).toEqual({
      bf: false,
      bt: true,
      s: 'string',
      ni: 1,
      nf: 0.5
    });
  });
});
