// Directive that emits an event whenever the view is initialized.

import { Directive, ElementRef, AfterViewInit, Output, EventEmitter, OnChanges } from '@angular/core';

@Directive({
  selector: '[async-content-loaded]'
})
export class AsyncContentLoadedDirective implements AfterViewInit {
  @Output()
  public initialized: EventEmitter<boolean> = new EventEmitter();

  constructor(private el: ElementRef) {}

  public ngAfterViewInit() {
    this.initialized.emit(true);
  }
}
