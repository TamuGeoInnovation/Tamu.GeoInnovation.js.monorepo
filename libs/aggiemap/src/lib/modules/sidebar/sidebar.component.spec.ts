import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { MapPopupModule } from '@tamu-gisc/maps/feature/popup';

import { AggiemapSidebarComponent } from './sidebar.component';

describe('AggiemapSidebarComponent', () => {
  let component: AggiemapSidebarComponent;
  let fixture: ComponentFixture<AggiemapSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SidebarModule,
        UITamuBrandingModule,
        RouterTestingModule,
        MapPopupModule,
        HttpClientTestingModule,
        EnvironmentModule,
        BrowserAnimationsModule
      ],
      declarations: [AggiemapSidebarComponent],
      providers: [
        {
          provide: env,
          useValue: { SearchSources: '', LayerSources: '' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AggiemapSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
