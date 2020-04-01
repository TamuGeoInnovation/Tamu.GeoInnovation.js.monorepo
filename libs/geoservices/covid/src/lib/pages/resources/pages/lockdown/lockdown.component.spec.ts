import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LockdownComponent } from './lockdown.component';

describe('LockdownComponent', () => {
  let component: LockdownComponent;
  let fixture: ComponentFixture<LockdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LockdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LockdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
