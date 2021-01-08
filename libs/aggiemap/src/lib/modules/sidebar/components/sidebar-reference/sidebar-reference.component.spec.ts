import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchModule } from '@tamu-gisc/search';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { LegendModule } from '@tamu-gisc/maps/feature/legend';
import { RouterTestingModule } from '@angular/router/testing';

import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';

import { LOCAL_STORAGE, StorageServiceModule } from 'ngx-webstorage-service';

import { SidebarReferenceComponent } from './sidebar-reference.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterlessTracking } from 'angulartics2';
import { Angulartics2Module } from 'angulartics2';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { RouterHistoryService } from '@tamu-gisc/common/ngx/router';

describe('SidebarReferenceComponent', () => {
  let component: SidebarReferenceComponent<__esri.Graphic>;
  let fixture: ComponentFixture<SidebarReferenceComponent<__esri.Graphic>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SearchModule,
        LayerListModule,
        LegendModule,
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
