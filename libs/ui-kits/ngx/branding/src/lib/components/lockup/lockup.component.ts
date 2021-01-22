import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'tamu-gisc-lockup',
  templateUrl: './lockup.component.html',
  styleUrls: ['./lockup.component.scss']
})
export class LockupComponent implements OnInit {
  @Input()
  public theme: 'light' | 'dark' = 'light';

  @Input()
  public type: 'college' | 'department' | 'division' | 'service' | 'deptWDivision' = 'college';

  @HostBinding('class')
  public get componentDecoration() {
    return [this.type, this.theme];
  }

  constructor() {}

  public ngOnInit(): void {}
}
