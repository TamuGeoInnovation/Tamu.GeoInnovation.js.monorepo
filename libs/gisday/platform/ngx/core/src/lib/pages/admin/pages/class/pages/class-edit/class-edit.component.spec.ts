import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassEditComponent } from './class-edit.component';

describe('ClassEditComponent', () => {
  let component: ClassEditComponent;
  let fixture: ComponentFixture<ClassEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClassEditComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

