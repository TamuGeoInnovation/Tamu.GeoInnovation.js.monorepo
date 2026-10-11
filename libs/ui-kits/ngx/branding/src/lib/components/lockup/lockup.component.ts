import { Component, HostBinding, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'tamu-gisc-lockup',
  templateUrl: './lockup.component.html',
  styleUrls: ['./lockup.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class LockupComponent {
  public readonly theme = input<'light' | 'dark'>('light');

  public readonly type = input<'college' | 'department' | 'division' | 'service' | 'deptWDivision'>('college');

  @HostBinding('class')
  public get componentDecoration() {
    return [this.type(), this.theme()];
  }
}
