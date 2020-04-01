import { Component, OnInit } from '@angular/core';
import { TestingSitesService, StatesService } from '@tamu-gisc/geoservices/data-access';
import { Observable } from 'rxjs';
import { TestingSite, County } from '@tamu-gisc/covid/common/entities';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import { switchMap, shareReplay } from 'rxjs/operators';

const storageOptions = { primaryKey: 'tamu-covid-vga' };

@Component({
  selector: 'tamu-gisc-testing-sites',
  templateUrl: './testing-sites.component.html',
  styleUrls: ['./testing-sites.component.scss']
})
export class TestingSitesComponent implements OnInit {
  public sites: Observable<Array<Partial<TestingSite>>>;

  constructor(private ts: TestingSitesService, private localStore: LocalStoreService, private st: StatesService) {}

  public ngOnInit() {
    const email = this.localStore.getStorageObjectKeyValue({ ...storageOptions, subKey: 'email' }) as string;
    const county = this.localStore.getStorageObjectKeyValue({ ...storageOptions, subKey: 'county' }) as Partial<County>;

    this.sites = this.st.getStateByFips(county.stateFips).pipe(
      switchMap((state) => {
        return this.ts.getTestingSitesForCounty(state.name, county.name);
      }),
      shareReplay(1)
    );
  }
}
