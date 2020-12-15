import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampusTotalsComponent } from './campus-totals.component';

describe('CampusTotalsComponent', () => {
  let component: CampusTotalsComponent;
  let fixture: ComponentFixture<CampusTotalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CampusTotalsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampusTotalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
