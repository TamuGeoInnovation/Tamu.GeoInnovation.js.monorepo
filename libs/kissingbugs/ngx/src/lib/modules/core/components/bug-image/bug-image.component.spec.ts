import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BugImageComponent } from './bug-image.component';

describe('BugImageComponent', () => {
  let component: BugImageComponent;
  let fixture: ComponentFixture<BugImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BugImageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BugImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
