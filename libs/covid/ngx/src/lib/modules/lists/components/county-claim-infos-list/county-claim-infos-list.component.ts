import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { CountyClaim } from '@tamu-gisc/covid/common/entities';

import { CountyClaimsService } from '../../../../data-access/county-claims/county-claims.service';

@Component({
  selector: 'tamu-gisc-county-claim-infos-list',
  templateUrl: './county-claim-infos-list.component.html',
  styleUrls: ['./county-claim-infos-list.component.scss']
})
export class CountyClaimInfosListComponent implements OnInit {
  @Input()
  public claimGuid: string;

  public infos: Observable<Partial<CountyClaim>>;

  constructor(private cl: CountyClaimsService, private route: ActivatedRoute) {}

  public ngOnInit(): void {
    // If a claim guid is specified, use that. Otherwise, attempt to get it from URL query params.
    const guid = this.claimGuid !== undefined ? this.claimGuid : this.route.snapshot.params.guid;

    this.infos = this.cl.getClaimInfos(guid).pipe(
      map((claim) => {
        claim.infos = claim.infos.sort(
          (a, b) => Date.parse((b.created as unknown) as string) - Date.parse((a.created as unknown) as string)
        );
        return claim;
      }),
      shareReplay(1)
    );
  }
}
