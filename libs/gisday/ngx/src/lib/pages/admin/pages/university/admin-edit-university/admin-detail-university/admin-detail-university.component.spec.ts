import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDetailUniversityComponent } from './admin-detail-university.component';

describe('AdminDetailUniversityComponent', () => {
  let component: AdminDetailUniversityComponent;
  let fixture: ComponentFixture<AdminDetailUniversityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminDetailUniversityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDetailUniversityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
