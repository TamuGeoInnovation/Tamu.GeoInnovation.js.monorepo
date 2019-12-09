import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { REV_ASCII, ReveilleConsoleLogComponent } from './reveille-console-log.component';

describe('ReveilleConsoleLogComponent', () => {
  let component: ReveilleConsoleLogComponent;
  let fixture: ComponentFixture<ReveilleConsoleLogComponent>;

  let consoleResults = '';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReveilleConsoleLogComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    console.log = (message) => {
      consoleResults = message;
    };
    fixture = TestBed.createComponent(ReveilleConsoleLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(consoleResults).toEqual(REV_ASCII);
  });
});
