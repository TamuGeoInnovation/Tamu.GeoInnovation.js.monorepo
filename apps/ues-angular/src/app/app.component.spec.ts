import { TestBed, async } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';

import { NotificationModule } from '@tamu-gisc/common/ngx/ui/notification';
import { RouterHistoryService } from '@tamu-gisc/common/ngx/router';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { Angulartics2Module, RouterlessTracking } from 'angulartics2';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, NotificationModule, Angulartics2Module.forRoot(), EnvironmentModule],
      declarations: [AppComponent],
      providers: [
        {
          provide: env,
          useValue: { NotificationEvents: [], SearchSources: [] }
        },
        RouterlessTracking,
        RouterHistoryService
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
