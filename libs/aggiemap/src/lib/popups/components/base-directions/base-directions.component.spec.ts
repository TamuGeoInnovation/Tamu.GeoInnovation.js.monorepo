import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { Angulartics2Module } from 'angulartics2';
import { LOCAL_STORAGE, StorageServiceModule } from 'ngx-webstorage-service';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';

import { BaseDirectionsComponent } from './base-directions.component';

import esri = __esri;

describe('BaseDirectionsComponent', () => {
  let component: BaseDirectionsComponent;
  let fixture: ComponentFixture<BaseDirectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
        Angulartics2Module.forRoot(),
        StorageServiceModule,
        EnvironmentModule
      ],
      declarations: [BaseDirectionsComponent],
      providers: [
        {
          provide: env,
          useValue: {
            SearchSources: [],
            NotificationEvents: [],
            LayerSources: [],
            RegionalBoundary: []
          }
        },
        {
          provide: AppStorage,
          useExisting: LOCAL_STORAGE
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseDirectionsComponent);
    component = fixture.componentInstance;
    component.data = ({
      attributes: {
        Number: 1111
      }
    } as unknown) as esri.Graphic;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
