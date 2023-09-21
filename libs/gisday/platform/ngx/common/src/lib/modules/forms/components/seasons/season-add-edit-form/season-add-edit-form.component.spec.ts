import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonAddEditFormComponent } from './season-add-edit-form.component';

describe('SeasonAddEditFormComponent', () => {
  let component: SeasonAddEditFormComponent;
  let fixture: ComponentFixture<SeasonAddEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeasonAddEditFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeasonAddEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
