import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveComponent } from './interactive.component';

describe('InteractiveComponent', () => {
  let component: InteractiveComponent;
  let fixture: ComponentFixture<InteractiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InteractiveComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

