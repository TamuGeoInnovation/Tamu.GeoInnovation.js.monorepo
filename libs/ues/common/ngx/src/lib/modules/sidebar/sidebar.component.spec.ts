import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { MapPopupModule } from '@tamu-gisc/maps/feature/popup';

import { UESCoreUIModule } from '../core-ui/core-ui.module';

import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          RouterTestingModule,
          SidebarModule,
          UESCoreUIModule,
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
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
