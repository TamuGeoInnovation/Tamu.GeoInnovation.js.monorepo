import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { NavigationBreadcrumbModule } from '@tamu-gisc/ui-kits/ngx/navigation/breadcrumb';

import { ScenariosListComponent } from './scenarios-list.component';
import { of } from 'rxjs';

describe('ScenariosListComponent', () => {
  let component: ScenariosListComponent;
  let fixture: ComponentFixture<ScenariosListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterTestingModule,
        UILayoutModule,
        NavigationBreadcrumbModule,
        HttpClientTestingModule,
        EnvironmentModule
      ],
      declarations: [ScenariosListComponent],
      providers: [
        {
          provide: env,
          useValue: { api_url: 'https://' }
        },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ route: '' }) }
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
