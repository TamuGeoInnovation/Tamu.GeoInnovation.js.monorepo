import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddUniversityComponent } from './admin-add-university.component';

describe('AdminAddUniversityComponent', () => {
  let component: AdminAddUniversityComponent;
  let fixture: ComponentFixture<AdminAddUniversityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminAddUniversityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAddUniversityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
