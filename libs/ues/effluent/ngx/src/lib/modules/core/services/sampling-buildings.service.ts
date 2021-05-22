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

  public getBuildingsIn(tierZone: string | { tier?: number; zone?: number }) {
    let tz = {
      tier: undefined,
      zone: undefined
    };

    if (tierZone instanceof String) {
      // If a string is provided, expect it to include both tier and zone.
      tz.tier = tierZone.split('-')[0];
      tz.zone = tierZone.split('-').pop();
    } else if (tierZone instanceof Object) {
      // If object is provided, can provide either or both tier and zone.
      tz = {
        tier: tierZone.tier,
        zone: tierZone.zone
      };
    }

    return this.buildingsResource.filter((metadata) => {
      const filtered = metadata.tiers.some((t) => {
        if (tz.tier && tz.zone) {
          // Both provided
          return t.tier === tz.tier && t.zone === tz.zone;
        } else if (tz.tier && tz.zone === undefined) {
          // Only tier is provided
          return t.tier === tz.tier;
        } else if (tz.zone && tz.tier === undefined) {
          // Only zone is provided
          return t.zone === tz.zone;
        }
      });

      return JSON.parse(JSON.stringify(filtered));
    });
  }
}
