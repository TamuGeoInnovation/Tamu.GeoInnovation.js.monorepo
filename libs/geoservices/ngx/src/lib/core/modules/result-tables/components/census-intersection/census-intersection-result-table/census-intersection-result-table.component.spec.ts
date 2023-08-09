import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CensusIntersectionResultTableComponent } from './census-intersection-result-table.component';

describe('CensusIntersectionResultTableComponent', () => {
  let component: CensusIntersectionResultTableComponent;
  let fixture: ComponentFixture<CensusIntersectionResultTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CensusIntersectionResultTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CensusIntersectionResultTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
