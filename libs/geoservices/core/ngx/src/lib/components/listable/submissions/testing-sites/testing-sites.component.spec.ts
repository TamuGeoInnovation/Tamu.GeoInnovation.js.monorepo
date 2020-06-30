import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

import { TestingSiteListComponent } from './testing-sites.component';

describe('TestingSiteListComponent', () => {
  let component: TestingSiteListComponent;
  let fixture: ComponentFixture<TestingSiteListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [PipesModule, EnvironmentModule, HttpClientTestingModule],
      declarations: [TestingSiteListComponent],
      providers: [
        {
          provide: env,
          useValue: { covid_api_url: 'https://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestingSiteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
