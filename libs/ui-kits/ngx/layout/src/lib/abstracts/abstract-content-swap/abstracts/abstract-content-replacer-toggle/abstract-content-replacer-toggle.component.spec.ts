import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractContentReplacerToggleComponent } from './abstract-content-replacer-toggle.component';

describe('AbstractContentReplacerToggleComponent', () => {
  let component: AbstractContentReplacerToggleComponent;
  let fixture: ComponentFixture<AbstractContentReplacerToggleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AbstractContentReplacerToggleComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbstractContentReplacerToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
