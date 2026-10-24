import { Component, OnInit, inject } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';
import { AsyncPipe } from '@angular/common';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';

@Component({
  selector: 'tamu-gisc-implementations',
  templateUrl: './implementations.component.html',
  styleUrls: ['./implementations.component.scss'],
  imports: [HighlightAuto, HighlightLineNumbers, AsyncPipe, HighlightPlusModule]
})
export class ImplementationsComponent implements OnInit {
  private readonly env = inject(EnvironmentService);

  public url: string;

  public ngOnInit() {
    this.url = this.env.value('accounts_url');
  }
}
