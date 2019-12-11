import { TestBed, async, inject, ComponentFixture } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

import { Angulartics2Module } from 'angulartics2';

import { UINavigationMobileTabModule } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tab';
import { NotificationModule } from '@tamu-gisc/common/ngx/ui/notification';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        Angulartics2Module.forRoot(),
        RouterTestingModule.withRoutes([]),
        UINavigationMobileTabModule,
        NotificationModule,
        EnvironmentModule
      ],
      declarations: [AppComponent],
      providers: [
        {
          provide: APP_BASE_HREF,
          useValue: ''
        },
        {
          provide: env,
          useValue: { NotificationEvents: [] }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });
});
