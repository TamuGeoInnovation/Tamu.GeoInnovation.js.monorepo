import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminViewClassesComponent } from './admin-view-classes.component';

describe('AdminViewClassesComponent', () => {
  let component: AdminViewClassesComponent;
  let fixture: ComponentFixture<AdminViewClassesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminViewClassesComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminViewClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
