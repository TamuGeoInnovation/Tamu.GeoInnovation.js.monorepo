import { Component, OnInit, ChangeDetectionStrategy, input } from '@angular/core';
import { Observable } from 'rxjs';
import { HighlightModule } from 'ngx-highlightjs';
import { NgClass, AsyncPipe } from '@angular/common';
import { ClipboardCopyDirective } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

@Component({
  selector: 'tamu-gisc-code-runner',
  templateUrl: './code-runner.component.html',
  styleUrls: ['./code-runner.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [HighlightModule, NgClass, ClipboardCopyDirective, AsyncPipe]
})
export class CodeRunnerComponent implements OnInit {
  public readonly code = input<string>(undefined);

  public readonly result = input<Observable<string>>(undefined);

  public renderable = false;

  public ngOnInit() {
    if (this.code() === undefined) {
      console.warn('Code runner did does not have code to render.');
    }
  }

  public execute() {
    if (this.renderable) {
      this.renderable = false;

      setTimeout(() => {
        this.renderable = true;
      }, 0);
    } else {
      this.renderable = true;
    }
  }
}
