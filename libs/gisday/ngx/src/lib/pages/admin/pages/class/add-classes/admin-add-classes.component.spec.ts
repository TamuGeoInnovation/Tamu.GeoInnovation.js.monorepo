import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddClassesComponent } from './admin-add-classes.component';

describe('AdminAddClassesComponent', () => {
  let component: AdminAddClassesComponent;
  let fixture: ComponentFixture<AdminAddClassesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminAddClassesComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAddClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
