import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RingDayMarkdownWDirectionsComponent } from './ring-day-markdown-w-directions.component';

describe('RingDayMarkdownWDirectionsComponent', () => {
  let component: RingDayMarkdownWDirectionsComponent;
  let fixture: ComponentFixture<RingDayMarkdownWDirectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RingDayMarkdownWDirectionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RingDayMarkdownWDirectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
