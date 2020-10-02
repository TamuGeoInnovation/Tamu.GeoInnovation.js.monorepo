import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { LockdownListComponent } from './lockdown.component';

describe('LockdownListComponent', () => {
  let component: LockdownListComponent;
  let fixture: ComponentFixture<LockdownListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [EnvironmentModule, HttpClientTestingModule],
      declarations: [LockdownListComponent],
      providers: [
        LockdownListComponent,
        {
          provide: env,
          useValue: { covid_api_url: 'https://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LockdownListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
