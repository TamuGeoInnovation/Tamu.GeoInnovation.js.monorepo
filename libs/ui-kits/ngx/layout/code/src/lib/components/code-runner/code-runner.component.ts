import { Component, OnInit, input, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';
import { NgClass, AsyncPipe } from '@angular/common';
import { ClipboardCopyDirective } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

@Component({
  selector: 'tamu-gisc-code-runner',
  templateUrl: './code-runner.component.html',
  styleUrls: ['./code-runner.component.scss'],
  imports: [HighlightAuto, HighlightLineNumbers, NgClass, ClipboardCopyDirective, AsyncPipe]
})
export class CodeRunnerComponent implements OnInit {
  public readonly code = input<string>(undefined);

  public readonly result = input<Observable<string>>(undefined);

  public readonly renderable = signal(false);

  public ngOnInit() {
    if (this.code() === undefined) {
      console.warn('Code runner did does not have code to render.');
    }
  }

  public execute() {
    if (this.renderable()) {
      this.renderable.set(false);

      setTimeout(() => {
        this.renderable.set(true);
      }, 0);
    } else {
      this.renderable.set(true);
    }
  }
}
