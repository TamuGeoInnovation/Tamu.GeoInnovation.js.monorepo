import { Injectable } from '@angular/core';

import { IEffluentTierMetadata } from '@tamu-gisc/ues/common/ngx';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class SamplingBuildingsService {
  private buildingsResource: Array<IEffluentTierMetadata>;

  constructor(private env: EnvironmentService) {
    this.buildingsResource = this.env.value('effluentTiers');
  }

  public getBuildingsIn(tierZone: string | { tier: number; zone: number }) {
    let tz = {
      tier: undefined,
      zone: undefined
    };

    if (tierZone instanceof String) {
      tz.tier = tierZone.split('-')[0];
      tz.zone = tierZone.split('-').pop();
    } else if (tierZone instanceof Object) {
      tz = { ...tierZone };
    }

    return this.buildingsResource.filter((metadata) => {
      return metadata.tiers.some((t) => {
        return t.tier === tz.tier && t.zone === tz.zone;
      });
    });
  }
}
