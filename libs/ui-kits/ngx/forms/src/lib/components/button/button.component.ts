import { Component, OnInit, Input, Output, EventEmitter, HostBinding } from '@angular/core';

@Component({
  selector: 'tamu-gisc-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {
  @Input()
  public type: 'button' | 'reset' | 'submit' = 'button';

  @Input()
  public value = 'Button';

  @Input()
  public fit: 'snug' | 'relaxed' = 'snug';

  @Output()
  public go: EventEmitter<boolean> = new EventEmitter();

  @HostBinding('class.snug')
  public get _fit() {
    return this.fit === 'snug';
  }

  constructor() {}

  public ngOnInit() {}
}
