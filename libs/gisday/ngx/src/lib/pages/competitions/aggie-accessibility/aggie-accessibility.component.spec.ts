import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AggieAccessibilityComponent } from './aggie-accessibility.component';

describe('AggieAccessibilityComponent', () => {
  let component: AggieAccessibilityComponent;
  let fixture: ComponentFixture<AggieAccessibilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AggieAccessibilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AggieAccessibilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
