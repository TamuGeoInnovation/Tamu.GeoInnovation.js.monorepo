import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminControlsComponent } from './admin-controls.component';

describe('AdminControlsComponent', () => {
  let component: AdminControlsComponent;
  let fixture: ComponentFixture<AdminControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminControlsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
