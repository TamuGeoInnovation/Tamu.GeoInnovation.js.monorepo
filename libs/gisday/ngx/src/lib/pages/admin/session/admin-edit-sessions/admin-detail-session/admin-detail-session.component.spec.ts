import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDetailSessionComponent } from './admin-detail-session.component';

describe('AdminDetailSessionComponent', () => {
  let component: AdminDetailSessionComponent;
  let fixture: ComponentFixture<AdminDetailSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminDetailSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDetailSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
