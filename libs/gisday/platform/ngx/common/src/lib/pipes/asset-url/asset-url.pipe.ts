import { Pipe, PipeTransform, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AssetsService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Pipe({ name: 'assetUrl' })
export class AssetUrlPipe implements PipeTransform {
  private readonly assetService = inject(AssetsService);

  public transform(path: string): Observable<string> {
    if (!path) {
      return null;
    }

    return this.assetService.getAssetUrl(path);
  }
}
