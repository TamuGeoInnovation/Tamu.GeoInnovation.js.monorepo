import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonEditComponent } from './season-edit.component';

describe('SeasonEditComponent', () => {
  let component: SeasonEditComponent;
  let fixture: ComponentFixture<SeasonEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeasonEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeasonEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
