import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { EsriModuleProviderService, EsriMapModule } from '@tamu-gisc/maps/esri';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { SearchModule } from '@tamu-gisc/search';

import { BaseComponent } from './base.component';

describe('BaseComponent', () => {
  let component: BaseComponent;
  let fixture: ComponentFixture<BaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        EnvironmentModule,
        EsriMapModule,
        SearchModule,
        LayerListModule
      ],
      declarations: [BaseComponent],
      providers: [
        EsriModuleProviderService,
        {
          provide: env,
          useValue: { SearchSources: [], LayerSources: [] }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseComponent);
    component = fixture.componentInstance;

    component.reference = 'test-reference';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
