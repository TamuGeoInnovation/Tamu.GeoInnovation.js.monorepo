import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LockdownListComponent } from './lockdown.component';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { HttpClientModule } from '@angular/common/http';

describe('LockdownListComponent', () => {
  let component: LockdownListComponent;
  let fixture: ComponentFixture<LockdownListComponent>;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ EnvironmentModule, HttpClientModule ],
      declarations: [ LockdownListComponent ],
      providers: [
        LockdownListComponent,
          {
            provide: env,
            useValue: { covid_api_url : 'https://' }
          }
      ]
    })
    .compileComponents();
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
