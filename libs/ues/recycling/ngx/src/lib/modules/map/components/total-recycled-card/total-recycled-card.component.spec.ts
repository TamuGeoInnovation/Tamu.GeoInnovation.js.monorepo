import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalRecycledCardComponent } from './total-recycled-card.component';

describe('TotalRecycledCardComponent', () => {
  let component: TotalRecycledCardComponent;
  let fixture: ComponentFixture<TotalRecycledCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TotalRecycledCardComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalRecycledCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
