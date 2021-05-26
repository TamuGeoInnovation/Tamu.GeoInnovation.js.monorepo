import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddCheckinsComponent } from './admin-add-checkins.component';

describe('AdminAddCheckinsComponent', () => {
  let component: AdminAddCheckinsComponent;
  let fixture: ComponentFixture<AdminAddCheckinsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminAddCheckinsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAddCheckinsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
