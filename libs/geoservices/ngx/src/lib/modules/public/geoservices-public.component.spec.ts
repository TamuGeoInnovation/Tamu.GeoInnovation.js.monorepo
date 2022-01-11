import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

import { UITileNavigationModule } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { UINavigationTriggersModule } from '@tamu-gisc/ui-kits/ngx/navigation/triggers';

import { GeoservicesCoreNgxModule } from '../core/geoservices-core-ngx.module';
import { GeoservicesPublicComponent } from './geoservices-public.component';

describe('GeoservicesPublicComponent', () => {
  let component: GeoservicesPublicComponent;
  let fixture: ComponentFixture<GeoservicesPublicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterTestingModule,
        GeoservicesCoreNgxModule,
        UITileNavigationModule,
        UINavigationTriggersModule
      ],
      declarations: [GeoservicesPublicComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoservicesPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
