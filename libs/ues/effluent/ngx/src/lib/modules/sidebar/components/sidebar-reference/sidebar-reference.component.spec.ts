import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { LegendModule } from '@tamu-gisc/maps/feature/legend';
import { RouterHistoryService } from '@tamu-gisc/common/ngx/router';
import { SearchModule } from '@tamu-gisc/search';

import { LOCAL_STORAGE, StorageServiceModule } from 'ngx-webstorage-service';
import { RouterlessTracking } from 'angulartics2';
import { Angulartics2Module } from 'angulartics2';

import { SidebarReferenceComponent } from './sidebar-reference.component';

describe('SidebarReferenceComponent', () => {
  let component: SidebarReferenceComponent<__esri.Graphic>;
  let fixture: ComponentFixture<SidebarReferenceComponent<__esri.Graphic>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SearchModule,
        LegendModule,
        LayerListModule,
        HttpClientTestingModule,
        EnvironmentModule,
        RouterTestingModule,
        Angulartics2Module.forRoot(),
        StorageServiceModule
      ],
      declarations: [SidebarReferenceComponent],
      providers: [
        {
          provide: env,
          useValue: { NotificationEvents: [], SearchSources: [], LayerSources: [], LegendSources: [] }
        },
        { provide: AppStorage, useExisting: LOCAL_STORAGE },

        RouterlessTracking,
        RouterHistoryService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarReferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
