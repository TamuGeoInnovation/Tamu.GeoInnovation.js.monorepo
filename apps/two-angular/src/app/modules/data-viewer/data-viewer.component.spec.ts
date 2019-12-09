import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataViewerComponent } from './data-viewer.component';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { ChartsModule } from '@tamu-gisc/charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { env, EnvironmentService } from '@tamu-gisc/common/ngx/environment';

describe('DataViewerComponent', () => {
  let component: DataViewerComponent;
  let fixture: ComponentFixture<DataViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule, UIFormsModule, ChartsModule],
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
