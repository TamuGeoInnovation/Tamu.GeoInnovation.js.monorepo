import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { NavigationBreadcrumbModule } from '@tamu-gisc/ui-kits/ngx/navigation/breadcrumb';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { WorkshopListComponent } from './workshop-list.component';

describe('WorkshopListComponent', () => {
  let component: WorkshopListComponent;
  let fixture: ComponentFixture<WorkshopListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, NavigationBreadcrumbModule, EnvironmentModule, HttpClientTestingModule],
      declarations: [WorkshopListComponent],
      providers: [
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkshopListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
