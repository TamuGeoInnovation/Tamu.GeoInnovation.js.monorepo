import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CensusYearsParameterFragmentComponent } from './census-years-parameter-fragment.component';

describe('CensusYearsParameterFragmentComponent', () => {
  let component: CensusYearsParameterFragmentComponent;
  let fixture: ComponentFixture<CensusYearsParameterFragmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CensusYearsParameterFragmentComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CensusYearsParameterFragmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
