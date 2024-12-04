import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownWDirectionsPopupComponent } from './markdown-w-directions-popup.component';

describe('MarkdownWDirectionsPopupComponent', () => {
  let component: MarkdownWDirectionsPopupComponent;
  let fixture: ComponentFixture<MarkdownWDirectionsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarkdownWDirectionsPopupComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownWDirectionsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
