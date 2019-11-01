import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReveilleConsoleLogComponent } from './reveille-console-log.component';

describe('ReveilleConsoleLogComponent', () => {
  let component: ReveilleConsoleLogComponent;
  let fixture: ComponentFixture<ReveilleConsoleLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReveilleConsoleLogComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReveilleConsoleLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
