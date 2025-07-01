import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicSummaryBlurbComponent } from './basic-summary-blurb.component';

describe('BasicSummaryBlurbComponent', () => {
  let component: BasicSummaryBlurbComponent;
  let fixture: ComponentFixture<BasicSummaryBlurbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BasicSummaryBlurbComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicSummaryBlurbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
