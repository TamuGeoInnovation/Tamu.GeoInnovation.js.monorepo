import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegendCollectionComponent } from './legend-collection.component';

describe('LegendCollectionComponent', () => {
  let component: LegendCollectionComponent;
  let fixture: ComponentFixture<LegendCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LegendCollectionComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LegendCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
