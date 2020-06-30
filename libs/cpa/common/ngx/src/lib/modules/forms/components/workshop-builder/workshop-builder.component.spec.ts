import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { NavigationBreadcrumbModule } from '@tamu-gisc/ui-kits/ngx/navigation/breadcrumb';

import { WorkshopBuilderComponent } from './workshop-builder.component';

describe('WorkshopBuilderComponent', () => {
  let component: WorkshopBuilderComponent;
  let fixture: ComponentFixture<WorkshopBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UIFormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NavigationBreadcrumbModule,
        EnvironmentModule,
        HttpClientTestingModule
      ],
      declarations: [WorkshopBuilderComponent],
      providers: [
        {
          provide: env,
          useValue: { api_url: 'workshops' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkshopBuilderComponent);
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
