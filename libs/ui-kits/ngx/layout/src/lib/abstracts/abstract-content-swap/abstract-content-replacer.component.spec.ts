import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractContentReplacerComponent } from './abstract-content-replacer.component';

describe('AbstractContentReplacerComponent', () => {
  let component: AbstractContentReplacerComponent;
  let fixture: ComponentFixture<AbstractContentReplacerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbstractContentReplacerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbstractContentReplacerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
