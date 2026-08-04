import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReplaySubject } from 'rxjs';

import { Angulartics2 } from 'angulartics2';
import { register } from 'swiper/element/bundle';
import { InitDetail } from 'lightgallery/lg-events';
import lightGallery from 'lightgallery';
import { LightGallery } from 'lightgallery/lightgallery';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';

@Component({
  selector: 'tamu-gisc-bonfire',
  templateUrl: './bonfire.component.html',
  styleUrls: ['./bonfire.component.scss']
})
export class BonfirePopupComponent extends BaseDirectionsComponent implements OnInit, AfterViewInit, AfterViewChecked {
  public load: ReplaySubject<boolean> = new ReplaySubject(1);
  public medias: Array<string> = [];

  public settings = {
    counter: false
  };

  @ViewChild('swiperRef', { static: false })
  private _swiperRef: ElementRef;

  private _lgInstance: LightGallery;
  private _needsRefresh = false;

  private _allMedias = [
    'fallen_BryanAMcClain.jpg',
    'fallen_ChadAPowell.jpg',
    'fallen_ChristopherDBreen.jpg',
    'fallen_ChristopherLeeHeard.jpg',
    'fallen_JamieLynnHand.jpg',
    'fallen_JeremyRichardFrampton.jpg',
    'fallen_JerryDonSelf.jpg',
    'fallen_LucasJohnKimmel.jpg',
    'fallen_MichaelStephenEbanks.jpg',
    'fallen_MirandaDeniseAdams.jpg',
    'fallen_NathanScottWest.jpg',
    'fallen_TimothyDoranKerleeJr.jpg',
    'historywalk_1.jpg',
    'historywalk_2.jpg',
    'historywalk_3.jpg',
    'historywalk_4.jpg',
    'historywalk_5.jpg',
    'historywalk_6.jpg',
    'lastcorps_1.jpg',
    'lastcorps_2.jpg',
    'lastcorps_3.jpg',
    'lastcorps_4.jpg',
    'memorial_1.jpg',
    'memorial_2.jpg'
  ];

  private fallenMap = {
    "Lucas John Kimmel '03": 'fallen_LucasJohnKimmel.jpg',
    "Bryan A. McClain '02": 'fallen_BryanAMcClain.jpg',
    "Christopher D. Breen '96": 'fallen_ChristopherDBreen.jpg',
    "Jeremy Richard Frampton '99": 'fallen_JeremyRichardFrampton.jpg',
    "Chad A. Powell '03": 'fallen_ChadAPowell.jpg',
    "Jerry Don Self '01": 'fallen_JerryDonSelf.jpg',
    "Michael Stephen Ebanks '03": 'fallen_MichaelStephenEbanks.jpg',
    "Jamie Lynn Hand '03": 'fallen_JamieLynnHand.jpg',
    "Timothy Doran Kerlee, Jr '03": 'fallen_TimothyDoranKerleeJr.jpg',
    "Christopher Lee Heard '03": 'fallen_ChristopherLeeHeard.jpg',
    "Miranda Denise Adams '02": 'fallen_MirandaDeniseAdams.jpg',
    "Nathan Scott West '02": 'fallen_NathanScottWest.jpg'
  };

  constructor(
    private rtr: Router,
    private rt: ActivatedRoute,
    private ps: TripPlannerService,
    private anl: Angulartics2,
    private mp: EsriMapService
  ) {
    super(rtr, rt, ps, anl, mp);
  }

  public override ngOnInit(): void {
    super.ngOnInit();

    if (this.data.attributes.Name) {
      // There are 4 categories of images, so we need to determine which category the image belongs to
      // fallen, historywalk, lastcorps, memorial

      const ignoreCaseName = this.data.attributes.Name.toLowerCase();
      let fileNames: string[] = [];

      // If the name start with "bonfire" then filter _allMedias by prefix `memorial_`
      if (ignoreCaseName.startsWith('bonfire')) {
        fileNames = this._allMedias.filter((media) => media.startsWith('memorial_'));
      }

      // If the name starts with `historywalk`  then filter _allMedias by prefix `historywalk_`
      if (ignoreCaseName.startsWith('history walk')) {
        fileNames = this._allMedias.filter((media) => media.startsWith('historywalk_'));
      }

      // If the name starts with `lastcorps` then filter _allMedias by prefix `lastcorps_`
      if (ignoreCaseName.startsWith('last corps')) {
        fileNames = this._allMedias.filter((media) => media.startsWith('lastcorps_'));
      }

      // The last category remains for the fallen. If none of the prior cases are met then the media is that of a fallen statue.
      // The name is going to be the same as the image name (minus extension and the fallen_ suffix), so we can just use the name as the image name.
      if (fileNames.length === 0) {
        // A fallen name follows the format "FirstName LastName `Year". Extract only first and last name, ignore year, and join the names with no space.
        const fallen = this.fallenMap[this.data.attributes.Name as keyof typeof this.fallenMap];

        if (fallen) {
          fileNames = [fallen];
        }
      }

      this.medias = fileNames.map((imgName: string) => {
        return `https://aggiemap.tamu.edu/images/bonfire/${imgName}`;
      });
    }
  }

  public ngAfterViewInit(): void {
    register();

    const opts = {
      slidesPerView: 1,
      speed: 500,
      loop: true,
      navigation: true,
      preventClicks: true,
      on: {
        init: () => {
          this._lgInstance = lightGallery(this._swiperRef.nativeElement, {});
        }
      }
    };

    Object.assign(this._swiperRef.nativeElement, opts);

    this._swiperRef.nativeElement.initialize();
  }

  // TODO: can be cleaned up?
  public onLightGalleryInit = (detail: InitDetail) => {
    this._lgInstance = detail.instance;
    this._needsRefresh = true;
  };

  // TODO: can be cleaned up?
  public ngAfterViewChecked(): void {
    if (this._needsRefresh) {
      this._lgInstance.refresh();
      this._needsRefresh = false;
    }
  }

  public override startDirections() {
    super.startDirections(`${this.data.attributes.Name}`);
  }
}
