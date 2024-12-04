import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownPopupComponent } from './markdown-popup.component';

describe('MarkdownPopupComponent', () => {
  let component: MarkdownPopupComponent;
  let fixture: ComponentFixture<MarkdownPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarkdownPopupComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
