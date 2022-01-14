import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Wayback2019Component } from './wayback-2019.component';

describe('Wayback2019Component', () => {
  let component: Wayback2019Component;
  let fixture: ComponentFixture<Wayback2019Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Wayback2019Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Wayback2019Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
