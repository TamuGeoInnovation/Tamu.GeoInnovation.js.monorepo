import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

abstract class AbstractInteractiveService<S, R> {
  public service: S;

  public form: FormGroup;
}

@Component({
  selector: 'tamu-gisc-abstract-interactive-service',
  template: ''
})
export class AbstractInteractiveServiceComponent<S, R> extends AbstractInteractiveService<S, R> {
  public service: S;

  constructor() {
    super();
  }
}