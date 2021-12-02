import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonListComponent } from './season-list.component';

describe('SeasonListComponent', () => {
  let component: SeasonListComponent;
  let fixture: ComponentFixture<SeasonListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SeasonListComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeasonListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
