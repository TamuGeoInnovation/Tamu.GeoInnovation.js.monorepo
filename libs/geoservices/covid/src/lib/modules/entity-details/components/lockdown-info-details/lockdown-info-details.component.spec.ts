import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LockdownInfoDetailsComponent } from './lockdown-info-details.component';

describe('LockdownInfoDetailsComponent', () => {
  let component: LockdownInfoDetailsComponent;
  let fixture: ComponentFixture<LockdownInfoDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LockdownInfoDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LockdownInfoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
