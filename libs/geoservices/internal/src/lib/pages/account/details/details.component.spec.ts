import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { DetailsComponent } from './details.component';

describe('DetailsComponent', () => {
  let component: DetailsComponent;
  let fixture: ComponentFixture<DetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, UIFormsModule, EnvironmentModule, HttpClientTestingModule],
      providers: [
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ],
      declarations: [DetailsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
