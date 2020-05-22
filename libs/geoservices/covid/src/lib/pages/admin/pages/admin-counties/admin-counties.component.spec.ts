import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCountiesComponent } from './admin-counties.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

describe('AdminCountiesComponent', () => {
  let component: AdminCountiesComponent;
  let fixture: ComponentFixture<AdminCountiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule],
      providers: [
        {
          provide: env, 
          useValue: { covid_api_url : 'https://' }
        }
      ],
      declarations: [ AdminCountiesComponent ]
    })
    .compileComponents();
  }));
 
  beforeEach(() => {
    
    fixture = TestBed.createComponent(AdminCountiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
