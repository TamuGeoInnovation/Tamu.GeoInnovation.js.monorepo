import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, ReplaySubject, shareReplay } from 'rxjs';

import { Angulartics2 } from 'angulartics2';
import { register } from 'swiper/element/bundle';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';
import { LocationMediaImage, LocationService } from '@tamu-gisc/aggiemap/ngx/data-access';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';

import { InitDetail } from 'lightgallery/lg-events';
import { LightGallery } from 'lightgallery/lightgallery';

@Component({
  selector: 'tamu-gisc-base-markdown',
  templateUrl: './base-markdown.component.html',
  styleUrls: ['../base-directions/base-directions.component.scss']
})
export class BaseMarkdownComponent extends BaseDirectionsComponent implements OnInit, AfterViewInit, AfterViewChecked {
  public medias: Observable<Array<LocationMediaImage>>;
  public load: ReplaySubject<boolean> = new ReplaySubject(1);

  @ViewChild('swiperRef', { static: true })
  private _swiperRef: ElementRef;

  private _lgInstance: LightGallery;
  private _needsRefresh = false;

  constructor(
    private rtr: Router,
    private rt: ActivatedRoute,
    private ps: TripPlannerService,
    private anl: Angulartics2,
    private ms: EsriMapService,
    private lss: LocationService
  ) {
    super(rtr, rt, ps, anl, ms);
  }

  public ngOnInit() {
    super.ngOnInit();

    this.medias = this.lss
      .getMediasForLocation(this.data.attributes.location.mrkId, this.data.attributes.location.catId)
      .pipe(shareReplay());
  }

  public ngAfterViewInit(): void {
    register();

    const opts = {
      on: {
        init: () => {
          console.log('Swiper initialized');
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
}

