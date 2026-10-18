import { Component, OnInit, input, signal } from '@angular/core';

import { ApiBase, TransformersMap } from '@tamu-gisc/geoprocessing-core';
import { HighlightModule } from 'ngx-highlightjs';

@Component({
  selector: 'tamu-gisc-response-viewer',
  templateUrl: './response-viewer.component.html',
  styleUrls: ['./response-viewer.component.scss'],
  imports: [HighlightModule]
})
export class ResponseViewerComponent<Type extends object, Res extends object> implements OnInit {
  public readonly runner = input<ApiBase<TransformersMap<Type>, Type, Res>>(undefined);

  public readonly format = input(undefined);

  public readonly result = signal<string>(undefined);

  public ngOnInit() {
    this.runner()
      .asObservable()
      .subscribe((res) => {
        if (res instanceof XMLDocument) {
          const serialized = new XMLSerializer().serializeToString(res);

          this.result.set(this.formatSerializedXML(serialized));
        } else if (res instanceof Object) {
          this.result.set(JSON.stringify(res, null, '   '));
        } else {
          this.result.set(res as unknown as string);
        }
      });
  }

  private formatSerializedXML(xml: string) {
    // Stolen from:
    // https://gist.github.com/sente/1083506/d2834134cd070dbcc08bf42ee27dabb746a1c54d
    let formatted = '';
    const reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\r\n$2$3');
    let pad = 0;

    xml.split('\r\n').forEach((node) => {
      let indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (node.match(/^<\/\w/)) {
        if (pad !== 0) {
          pad -= 1;
        }
      } else if (node.match(/^<\w[^>]*[^/]>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }

      let padding = '';
      for (let i = 0; i < pad; i++) {
        padding += '  ';
      }

      formatted += padding + node + '\r\n';
      pad += indent;
    });

    return formatted;
  }
}
