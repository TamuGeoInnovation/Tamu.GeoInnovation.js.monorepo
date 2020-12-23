import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { ResultLookupPipe } from '../../pipes/result-lookup.pipe';

import { ExistingComponent } from './existing.component';

describe('ExistingComponent', () => {
  let component: ExistingComponent;
  let fixture: ComponentFixture<ExistingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule],
      declarations: [ExistingComponent, ResultLookupPipe],
      providers: [
        {
          provide: env,
          useValue: { apiUrl: '' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExistingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
