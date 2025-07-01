import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CensusIntersectionComponent } from './census-intersection.component';

describe('CensusIntersectionComponent', () => {
  let component: CensusIntersectionComponent;
  let fixture: ComponentFixture<CensusIntersectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CensusIntersectionComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CensusIntersectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
