import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RingDayMarkdownComponent } from './ring-day-markdown.component';

describe('RingDayMarkdownComponent', () => {
  let component: RingDayMarkdownComponent;
  let fixture: ComponentFixture<RingDayMarkdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RingDayMarkdownComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RingDayMarkdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
