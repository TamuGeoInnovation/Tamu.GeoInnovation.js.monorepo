import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LockdownInfosListComponent } from './lockdown-infos-list.component';

describe('LockdownInfosListComponent', () => {
  let component: LockdownInfosListComponent;
  let fixture: ComponentFixture<LockdownInfosListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LockdownInfosListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LockdownInfosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
