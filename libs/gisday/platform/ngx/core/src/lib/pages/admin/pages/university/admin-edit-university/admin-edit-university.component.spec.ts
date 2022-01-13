import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditUniversityComponent } from './admin-edit-university.component';

describe('AdminEditUniversityComponent', () => {
  let component: AdminEditUniversityComponent;
  let fixture: ComponentFixture<AdminEditUniversityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminEditUniversityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminEditUniversityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
