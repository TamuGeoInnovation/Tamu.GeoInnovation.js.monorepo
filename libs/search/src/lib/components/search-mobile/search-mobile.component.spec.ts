import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { Angulartics2Module } from 'angulartics2';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { NotificationModule } from '@tamu-gisc/common/ngx/ui/notification';

import { SearchMobileComponent } from './search-mobile.component';

describe('SearchMobileComponent (shallow)', () => {
  let component: SearchMobileComponent<{}>;
  let fixture: ComponentFixture<SearchMobileComponent<{}>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
        Angulartics2Module.forRoot(),
        EnvironmentModule,
        NotificationModule
      ],
      declarations: [SearchMobileComponent],
      providers: [
        {
          provide: env,
          useValue: { NotificationEvents: [], SearchSources: [] }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
