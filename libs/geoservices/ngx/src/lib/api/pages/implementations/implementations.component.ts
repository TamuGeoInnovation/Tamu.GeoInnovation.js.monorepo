import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { HighlightModule } from 'ngx-highlightjs';
import { AsyncPipe } from '@angular/common';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';

@Component({
  selector: 'tamu-gisc-implementations',
  templateUrl: './implementations.component.html',
  styleUrls: ['./implementations.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [HighlightModule, AsyncPipe, HighlightPlusModule]
})
export class ImplementationsComponent implements OnInit {
  public url: string;

  constructor(private readonly env: EnvironmentService) {}

  public ngOnInit() {
    this.url = this.env.value('accounts_url');
  }
}
