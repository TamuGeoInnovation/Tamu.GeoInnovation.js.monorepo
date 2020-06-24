import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LockdownDetailsComponent } from './lockdown-details.component';

describe('LockdownDetailsComponent', () => {
  let component: LockdownDetailsComponent;
  let fixture: ComponentFixture<LockdownDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LockdownDetailsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LockdownDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
