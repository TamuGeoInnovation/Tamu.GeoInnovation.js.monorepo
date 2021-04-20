import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditClassesComponent } from './admin-edit-classes.component';

describe('AdminEditClassesComponent', () => {
  let component: AdminEditClassesComponent;
  let fixture: ComponentFixture<AdminEditClassesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminEditClassesComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminEditClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
