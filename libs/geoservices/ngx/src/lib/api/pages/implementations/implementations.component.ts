import { Component, OnInit } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Component({
  selector: 'tamu-gisc-implementations',
  templateUrl: './implementations.component.html',
  styleUrls: ['./implementations.component.scss']
})
export class ImplementationsComponent implements OnInit {
  public url: string;

  constructor(private readonly env: EnvironmentService) {}

  public ngOnInit() {
    this.url = this.env.value('accounts_url');
  }
}
