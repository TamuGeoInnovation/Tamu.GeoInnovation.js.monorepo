import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { Angulartics2Module } from 'angulartics2';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { NotificationModule } from '@tamu-gisc/common/ngx/ui/notification';

import { SearchComponent } from './search.component';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
        Angulartics2Module.forRoot(),
        EnvironmentModule,
        NotificationModule
      ],
      declarations: [SearchComponent],
      providers: [
        {
          provide: env,
          useValue: { NotificationEvents: [], SearchSources: [] }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
