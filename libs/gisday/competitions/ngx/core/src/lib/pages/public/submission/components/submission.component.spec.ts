import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { Angulartics2Module } from 'angulartics2';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';

import { SubmissionComponent } from './submission.component';

describe('SubmissionComponent', () => {
  let component: SubmissionComponent;
  let fixture: ComponentFixture<SubmissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        Angulartics2Module.forRoot(),
        EnvironmentModule,
        SettingsModule,
        UIFormsModule
      ],
      declarations: [SubmissionComponent],
      providers: [
        {
          provide: env,
          useValue: { LocalStoreSettings: {}, NotificationEvents: [] }
        }
      ]
    }).compileComponents();
  }));

  // Need to disable `any` on this line to be able to mock the navigator geolocation API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).navigator.geolocation = {
    watchPosition: jest.fn()
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
