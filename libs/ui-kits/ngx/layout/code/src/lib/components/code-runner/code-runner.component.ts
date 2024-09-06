import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'tamu-gisc-code-runner',
  templateUrl: './code-runner.component.html',
  styleUrls: ['./code-runner.component.scss']
})
export class CodeRunnerComponent implements OnInit {
  @Input()
  public code: string;

  @Input()
  public result: Observable<string>;

  public renderable = false;

  public ngOnInit() {
    if (this.code === undefined) {
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
