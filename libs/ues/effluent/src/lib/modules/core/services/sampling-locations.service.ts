import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { IEffluentSample } from '@tamu-gisc/ues/common/ngx';

@Injectable({
  providedIn: 'root'
})
export class SamplingLocationsService {
  private samplesResource: Array<IEffluentSample>;

  constructor(private env: EnvironmentService) {
    this.samplesResource = this.env.value('effluentSamples');
  }

  public getSamplingLocation(location: string | { tier: number; sample: number }) {
    let loc = { tier: undefined, sample: undefined };

    if (location instanceof String) {
      loc.tier = location.split('-')[0];
      loc.sample = location.split('-').pop();
    } else if (location instanceof Object) {
      loc = { ...location };
    }

    if (loc.tier !== undefined && loc.sample !== undefined) {
      return this.samplesResource.find((r) => {
        return r.sample === `${loc.tier}-${loc.sample}`;
      });
    } else {
      return null;
    }
  }
}
