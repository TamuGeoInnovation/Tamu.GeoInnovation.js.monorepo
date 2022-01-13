import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCheckinsComponent } from './admin-checkins.component';

describe('AdminCheckinsComponent', () => {
  let component: AdminCheckinsComponent;
  let fixture: ComponentFixture<AdminCheckinsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminCheckinsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCheckinsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
