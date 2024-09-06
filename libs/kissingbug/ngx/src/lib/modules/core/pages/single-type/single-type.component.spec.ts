import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleTypeComponent } from './single-type.component';

describe('SingleTypeComponent', () => {
  let component: SingleTypeComponent;
  let fixture: ComponentFixture<SingleTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SingleTypeComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
