import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { LOCAL_STORAGE } from 'ngx-webstorage-service';
import { Angulartics2Module, RouterlessTracking } from 'angulartics2';

import { SearchModule } from '@tamu-gisc/search';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { RouterHistoryService } from '@tamu-gisc/common/ngx/router';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';

import { AggiemapCoreUIModule } from '../../../core-ui/core-ui.module';

import { OmnisearchComponent } from './omnisearch.component';

describe('OmnisearchComponent', () => {
  let component: OmnisearchComponent;
  let fixture: ComponentFixture<OmnisearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SearchModule,
        AggiemapCoreUIModule,
        HttpClientTestingModule,
        EnvironmentModule,
        RouterTestingModule,
        Angulartics2Module.forRoot(),
        BrowserAnimationsModule
      ],
      declarations: [OmnisearchComponent],
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
    fixture = TestBed.createComponent(OmnisearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
