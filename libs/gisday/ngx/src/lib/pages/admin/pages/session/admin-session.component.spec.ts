import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSessionComponent } from './admin-session.component';

describe('AdminSessionComponent', () => {
  let component: AdminSessionComponent;
  let fixture: ComponentFixture<AdminSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
