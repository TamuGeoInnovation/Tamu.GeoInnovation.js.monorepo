import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccoutHeaderComponent } from './accout-header.component';

describe('AccoutHeaderComponent', () => {
  let component: AccoutHeaderComponent;
  let fixture: ComponentFixture<AccoutHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccoutHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccoutHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
