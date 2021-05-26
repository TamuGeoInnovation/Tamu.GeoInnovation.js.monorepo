import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminViewUniversityComponent } from './admin-view-university.component';

describe('AdminViewUniversityComponent', () => {
  let component: AdminViewUniversityComponent;
  let fixture: ComponentFixture<AdminViewUniversityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminViewUniversityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminViewUniversityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
