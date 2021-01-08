import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { MapPopupModule } from '@tamu-gisc/maps/feature/popup';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { UESCoreUIModule } from '@tamu-gisc/ues/common/ngx';

import { SidebarComponent } from './sidebar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SidebarModule,
        UESCoreUIModule,
        RouterTestingModule,
        MapPopupModule,
        HttpClientTestingModule,
        EnvironmentModule,
        BrowserAnimationsModule
      ],
      declarations: [SidebarComponent],
      providers: [
        {
          provide: env,
          useValue: { SearchSources: 'https://', LayerSources: 'https://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
