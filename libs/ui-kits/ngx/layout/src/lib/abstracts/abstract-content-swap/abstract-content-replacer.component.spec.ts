import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractContentReplacerComponent } from './abstract-content-replacer.component';

describe('AbstractContentReplacerComponent', () => {
  let component: AbstractContentReplacerComponent;
  let fixture: ComponentFixture<AbstractContentReplacerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AbstractContentReplacerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbstractContentReplacerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use SwapContent correctly', () => {
    component.swapContent({ index: 9, label: 'yeet', template: undefined });
    expect(component.toggleIndex).toEqual(9);
    component.swapContent(8);
    expect(component.toggleIndex).toEqual(8);
  });
});
