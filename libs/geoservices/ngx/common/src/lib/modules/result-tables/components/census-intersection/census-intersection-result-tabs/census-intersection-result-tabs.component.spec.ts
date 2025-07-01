import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CensusIntersectionResultTabsComponent } from './census-intersection-result-tabs.component';

describe('CensusIntersectionResultTabsComponent', () => {
  let component: CensusIntersectionResultTabsComponent;
  let fixture: ComponentFixture<CensusIntersectionResultTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CensusIntersectionResultTabsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CensusIntersectionResultTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
