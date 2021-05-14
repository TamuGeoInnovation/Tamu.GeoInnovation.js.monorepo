import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { env, EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { Angulartics2Module } from 'angulartics2';

import { LOCAL_STORAGE, StorageServiceModule } from 'ngx-webstorage-service';

import { TentZonePopupComponent } from './tent-zone.component';

import esri = __esri;

describe('TentZonePopupComponent', () => {
  let component: TentZonePopupComponent;
  let fixture: ComponentFixture<TentZonePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        Angulartics2Module.forRoot(),
        StorageServiceModule
      ],
      declarations: [TentZonePopupComponent],
      providers: [
        EnvironmentService,
        {
          provide: env,
          useValue: {
            SearchSources: [],
            NotificationEvents: [],
            LayerSources: []
          }
        },
        {
          provide: AppStorage,
          useExisting: LOCAL_STORAGE
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TentZonePopupComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    component.data = ({
      attributes: {
        Number: 1111
      }
    } as unknown) as esri.Graphic;

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
});
