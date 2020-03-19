import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderCovidComponent } from './header-covid.component';

describe('HeaderCovidComponent', () => {
  let component: HeaderCovidComponent;
  let fixture: ComponentFixture<HeaderCovidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderCovidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderCovidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
