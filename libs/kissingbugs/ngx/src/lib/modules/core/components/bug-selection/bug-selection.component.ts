import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Component({
  selector: 'tamu-gisc-kissingbugs-bug-selection',
  templateUrl: './bug-selection.component.html',
  styleUrls: ['./bug-selection.component.scss']
})
export class BugSelectionComponent implements OnInit, OnDestroy {
  constructor(private environment: EnvironmentService) {}

  public ngOnInit() {
    const a = document.getElementById('a').classList.add('active');
    const g = document.getElementById('g');
    const i = document.getElementById('i');
    const l = document.getElementById('l');
    const s = document.getElementById('s');
    const o = document.getElementById('o');
  }

  public ngOnDestroy() {}
}

// a, g, i, l, s, o
