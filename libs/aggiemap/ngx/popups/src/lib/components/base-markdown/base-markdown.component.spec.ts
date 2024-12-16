import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseMarkdownComponent } from './base-markdown.component';

describe('BaseMarkdownComponent', () => {
  let component: BaseMarkdownComponent;
  let fixture: ComponentFixture<BaseMarkdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaseMarkdownComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseMarkdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

