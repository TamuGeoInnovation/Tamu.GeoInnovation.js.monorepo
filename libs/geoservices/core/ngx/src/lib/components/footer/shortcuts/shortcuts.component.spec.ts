import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterShortcutsComponent } from './shortcuts.component';

describe('FooterShortcutsComponent', () => {
  let component: FooterShortcutsComponent;
  let fixture: ComponentFixture<FooterShortcutsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FooterShortcutsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterShortcutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
