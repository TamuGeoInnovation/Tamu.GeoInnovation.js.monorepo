import { Component, OnInit, Input } from '@angular/core';

import { ApiBase, TransformersMap } from '@tamu-gisc/geoprocessing-core';

@Component({
  selector: 'tamu-gisc-response-viewer',
  templateUrl: './response-viewer.component.html',
  styleUrls: ['./response-viewer.component.scss']
})
export class ResponseViewerComponent<Type extends object, Res extends object> implements OnInit {
  @Input()
  public runner: ApiBase<TransformersMap<Type>, Type, Res>;

  @Input()
  public format;

  public result;

  public ngOnInit() {
    this.runner.asObservable().subscribe((res) => {
      if (res instanceof XMLDocument) {
        const serialized = new XMLSerializer().serializeToString(res);

        this.result = this.formatSerializedXML(serialized);
      } else if (res instanceof Object) {
        this.result = JSON.stringify(res, null, '   ');
      } else {
        this.result = res;
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
