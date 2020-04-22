import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LockdownListComponent } from './lockdown.component';

describe('LockdownListComponent', () => {
  let component: LockdownListComponent;
  let fixture: ComponentFixture<LockdownListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LockdownListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LockdownListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
