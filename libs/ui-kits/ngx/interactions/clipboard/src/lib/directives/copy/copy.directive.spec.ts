import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Subject } from 'rxjs';

import {} from 'jest';

import { ClipboardCopyDirective } from './copy.directive';

// TODO: Actually test the directive
@Component({
  template: `
    <div clipboard-copy text="text to copy" (copying)="copyEvent.next($value)"></div>
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

  // it('should emit copy event on click', (done) => {
  //   component.copyEvent.subscribe((v) => {
  //     expect(v).toBeTruthy();

  //     done();
  //   });

  //   fixture.debugElement.query()

  //   debugger
  // });
});
