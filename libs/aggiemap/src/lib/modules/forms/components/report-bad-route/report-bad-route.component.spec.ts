import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { LOCAL_STORAGE } from 'ngx-webstorage-service';
import { Angulartics2Module, RouterlessTracking } from 'angulartics2';

import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { RouterHistoryService } from '@tamu-gisc/common/ngx/router';

import { ReportBadRouteComponent } from './report-bad-route.component';

describe('ReportBadRouteComponent', () => {
  let component: ReportBadRouteComponent;
  let fixture: ComponentFixture<ReportBadRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule, HttpClientTestingModule, EnvironmentModule, Angulartics2Module.forRoot()],
      declarations: [ReportBadRouteComponent],
      providers: [
        RouterlessTracking,
        RouterHistoryService,
        {
          provide: env,
          useValue: { SearchSources: [], NotificationEvents: [], LayerSources: [] }
        },
        {
          provide: AppStorage,
          useExisting: LOCAL_STORAGE
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportBadRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
