import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'tamu-gisc-lockup',
  templateUrl: './lockup.component.html',
  styleUrls: ['./lockup.component.scss']
})
export class LockupComponent {
  @Input()
  public theme: 'light' | 'dark' = 'light';

  @Input()
  public type: 'college' | 'department' | 'division' | 'service' | 'deptWDivision' = 'college';

  @HostBinding('class')
  public get componentDecoration() {
    return [this.type, this.theme];
  }
}
