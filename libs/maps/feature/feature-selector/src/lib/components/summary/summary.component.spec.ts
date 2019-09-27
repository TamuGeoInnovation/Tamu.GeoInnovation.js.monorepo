import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionSummaryComponent } from './summary.component';

describe('SelectionSummaryComponent', () => {
  let component: SelectionSummaryComponent;
  let fixture: ComponentFixture<SelectionSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectionSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
