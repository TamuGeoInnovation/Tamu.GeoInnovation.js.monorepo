import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MapsMapboxModule } from '@tamu-gisc/maps/mapbox';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { LockdownMapComponent } from './lockdown-map.component';

describe('LockdownMapComponent', () => {
  let component: LockdownMapComponent;
  let fixture: ComponentFixture<LockdownMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MapsMapboxModule,
        UILayoutModule,
        UIFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        EnvironmentModule,
        BrowserAnimationsModule
      ],
      declarations: [LockdownMapComponent],
      providers: [
        {
          provide: env,
          useValue: { covid_api_url: 'https://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LockdownMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
