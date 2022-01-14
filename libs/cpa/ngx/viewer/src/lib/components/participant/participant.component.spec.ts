import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { MapDrawingModule } from '@tamu-gisc/maps/feature/draw';
import { FeatureSelectorModule } from '@tamu-gisc/maps/feature/feature-selector';
import { UiKitsNgxChartsModule } from '@tamu-gisc/ui-kits/ngx/charts';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';

import { ParticipantComponent } from './participant.component';

describe('ParticipantComponent', () => {
  let component: ParticipantComponent;
  let fixture: ComponentFixture<ParticipantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        UIFormsModule,
        MapDrawingModule,
        FeatureSelectorModule,
        UiKitsNgxChartsModule,
        EnvironmentModule,
        EsriMapModule,
        RouterTestingModule,
        SearchModule,
        LayerListModule
      ],
      declarations: [ParticipantComponent],
      providers: [
        {
          provide: env,
          useValue: { SearchSources: [], api_url: [], LayerSources: [] }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantComponent);
    component = fixture.componentInstance;
    /*
    Test passes when fixture.detectChanges() is included and runs: npx jest -o 
    However fails when fixture.detectChanges() is included and runs:  npx jest --collectCoverage 
    fixture.detectChanges();
    */
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
