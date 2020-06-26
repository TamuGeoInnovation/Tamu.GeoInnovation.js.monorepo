import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { NavigationBreadcrumbModule } from '@tamu-gisc/ui-kits/ngx/navigation/breadcrumb';

import { ScenariosListComponent } from './scenarios-list.component';

describe('ScenariosListComponent', () => {
  let component: ScenariosListComponent;
  let fixture: ComponentFixture<ScenariosListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, NavigationBreadcrumbModule, HttpClientTestingModule, EnvironmentModule],
      declarations: [ScenariosListComponent],
      providers: [
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScenariosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
