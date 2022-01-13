import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UiKitsNgxChartsModule } from '@tamu-gisc/ui-kits/ngx/charts';
import { env, EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { DataViewerComponent } from './data-viewer.component';

describe('DataViewerComponent', () => {
  let component: DataViewerComponent;
  let fixture: ComponentFixture<DataViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule, UIFormsModule, UiKitsNgxChartsModule],
      declarations: [DataViewerComponent],
      providers: [
        EnvironmentService,
        {
          provide: env,
          useValue: { api_url: 'http://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
