import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CensusIntersectionBasicComponent } from './census-intersection-basic.component';

describe('CensusIntersectionBasicComponent', () => {
  let component: CensusIntersectionBasicComponent;
  let fixture: ComponentFixture<CensusIntersectionBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CensusIntersectionBasicComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CensusIntersectionBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
