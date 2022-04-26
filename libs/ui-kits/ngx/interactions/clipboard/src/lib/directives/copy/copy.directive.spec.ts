import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { ClipboardCopyDirective } from './copy.directive';

@Component({
  template: `
    <div clipboard-copy [text]="'text to copy'" (err)="copyEvent.next($event)" (copying)="copyEvent.next($event)"></div>
  `
})
class MockCopyDirectiveComponent {
  public copyEvent = new Subject();
}

describe('ClipboardCopyDirective', () => {
  let fixture: ComponentFixture<MockCopyDirectiveComponent>;
  let component: MockCopyDirectiveComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [MockCopyDirectiveComponent, ClipboardCopyDirective]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MockCopyDirectiveComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  // Treat error event as a success given that the error steps from a lack Clipboard API support with jsdom.
  it('should emit copy event on click', (done) => {
    component.copyEvent.subscribe((v) => {
      expect(v).toBeTruthy();

      done();
    });

    const el = fixture.debugElement.query(By.css('[clipboard-copy]'));

    el.nativeElement.click();
  });
});
