import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerspectiveToggleComponent } from './perspective-toggle.component';

describe('PerspectiveToggleComponent', () => {
  let component: PerspectiveToggleComponent;
  let fixture: ComponentFixture<PerspectiveToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerspectiveToggleComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerspectiveToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
