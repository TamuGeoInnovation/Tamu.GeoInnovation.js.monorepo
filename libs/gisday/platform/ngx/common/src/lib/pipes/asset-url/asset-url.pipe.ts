import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';

import { AssetsService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Pipe({
  name: 'assetUrl'
})
export class AssetUrlPipe implements PipeTransform {
  constructor(private readonly assetService: AssetsService) {}

  public transform(guid: string): Observable<string> {
    if (!guid) {
      return null;
    }

    return this.assetService.getAssetUrl(guid);
  }
}
