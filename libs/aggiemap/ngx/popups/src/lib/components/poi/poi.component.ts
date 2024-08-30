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
  selector: 'tamu-gisc-poi-popup-component',
  templateUrl: './poi.component.html',
  styleUrls: ['../base/base.popup.component.scss']
})
export class PoiPopupComponent extends BaseDirectionsComponent implements OnInit, AfterViewInit, AfterViewChecked {
  public load: ReplaySubject<boolean> = new ReplaySubject(1);
  public medias: Array<string> = [];

  public settings = {
    counter: false
  };

  @ViewChild('swiperRef', { static: false })
  private _swiperRef: ElementRef;

  private _lgInstance: LightGallery;
  private _needsRefresh = false;

  constructor(
    private rtr: Router,
    private rt: ActivatedRoute,
    private ps: TripPlannerService,
    private anl: Angulartics2,
    private mp: EsriMapService
  ) {
    super(rtr, rt, ps, anl, mp);
  }

  public ngOnInit(): void {
    super.ngOnInit();

    this.medias = this.data.attributes.images.split(',').map((imgName) => {
      return `https://aggiemap.tamu.edu/images/cb/${imgName}`;
    });
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
          console.log('swiper initialized');

          this._lgInstance = lightGallery(this._swiperRef.nativeElement, {});
        }
      }
    };

    Object.assign(this._swiperRef.nativeElement, opts);

    this._swiperRef.nativeElement.initialize();
  }

  public onLightGalleryInit = (detail: InitDetail) => {
    console.log('LightGallery initialized');

    this._lgInstance = detail.instance;
    this._needsRefresh = true;
  };

  public ngAfterViewChecked(): void {
    if (this._needsRefresh) {
      this._lgInstance.refresh();
      this._needsRefresh = false;
    }
  }

  public startDirections() {
    super.startDirections(`${this.data.attributes.Name}`);
  }
}

