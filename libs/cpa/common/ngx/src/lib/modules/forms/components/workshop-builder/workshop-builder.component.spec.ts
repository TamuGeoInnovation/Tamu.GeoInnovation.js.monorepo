import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';

import { ReactiveFormsModule } from '@angular/forms';

import { NavigationBreadcrumbModule } from '@tamu-gisc/ui-kits/ngx/navigation/breadcrumb';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { WorkshopBuilderComponent } from './workshop-builder.component';

describe('WorkshopBuilderComponent', () => {
  let component: WorkshopBuilderComponent;
  let fixture: ComponentFixture<WorkshopBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NavigationBreadcrumbModule,
        UIFormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        EnvironmentModule
      ],
      declarations: [WorkshopBuilderComponent],
      providers: [
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkshopBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
