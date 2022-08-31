import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CensusRecordFragmentComponent } from './census-record-fragment.component';

describe('CensusRecordFragmentComponent', () => {
  let component: CensusRecordFragmentComponent;
  let fixture: ComponentFixture<CensusRecordFragmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CensusRecordFragmentComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CensusRecordFragmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
