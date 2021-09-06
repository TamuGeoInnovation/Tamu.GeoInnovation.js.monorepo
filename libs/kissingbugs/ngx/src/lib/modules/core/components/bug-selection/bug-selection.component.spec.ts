import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BugSelectionComponent } from './bug-selection.component';

describe('BugSelectionComponent', () => {
  let component: BugSelectionComponent;
  let fixture: ComponentFixture<BugSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BugSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BugSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
