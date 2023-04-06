import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CensusIntersectionAdvancedComponent } from './census-intersection-advanced.component';

describe('CensusIntersectionAdvancedComponent', () => {
  let component: CensusIntersectionAdvancedComponent;
  let fixture: ComponentFixture<CensusIntersectionAdvancedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CensusIntersectionAdvancedComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CensusIntersectionAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

