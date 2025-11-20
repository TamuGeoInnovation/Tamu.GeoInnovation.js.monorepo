import { Component, Inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

import { SubmissionReviewDto, SubmissionMediaDto } from '@tamu-gisc/gisday/competitions/data-api/types';
import { MODAL_DATA, ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { EsriMapService, MapConfig } from '@tamu-gisc/maps/esri';
import { COMPETITION_VALIDATION_STATUS } from '@tamu-gisc/gisday/common';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-submission-detail-modal',
  templateUrl: './submission-detail-modal.component.html',
  styleUrls: ['./submission-detail-modal.component.scss']
})
export class SubmissionDetailModalComponent implements OnInit {
  public submission: SubmissionReviewDto;
  public isAdmin = false;
  public images$: Observable<Array<{ guid: string; url: SafeUrl }>>;
  public VALIDATION_STATUS = COMPETITION_VALIDATION_STATUS;
  public mapConfig: MapConfig;

  constructor(
    @Inject(MODAL_DATA) private readonly data: SubmissionDetailModalData,
    private readonly modalRef: ModalRefService,
    private readonly submissionService: SubmissionService,
    private readonly sanitizer: DomSanitizer,
    private readonly ns: NotificationService,
    private readonly mapService: EsriMapService
  ) {
    this.submission = this.data.submission;
    this.isAdmin = this.data.isAdmin;
  }

  public ngOnInit(): void {
    // Load images for the submission
    this.images$ = this.submissionService.getSubmissionImages(this.submission.guid).pipe(
      map((images: SubmissionMediaDto[]) => {
        return images.map((img) => ({
          guid: img.guid,
          url: this.createImageUrl(img.blob, img.mimeType)
        }));
      })
    );

    // Configure map centered on submission location
    this.mapConfig = {
      basemap: {
        basemap: 'streets-navigation-vector'
      },
      view: {
        mode: '2d',
        properties: {
          center: [this.submission.location.longitude, this.submission.location.latitude],
          zoom: 18
        }
      }
    };

    // Add marker for submission location after map loads
    this.mapService.store.pipe(take(1)).subscribe((instances) => {
      if (instances.view && instances.view.type === '2d') {
        this.addSubmissionMarker(instances.view as esri.MapView);
      }
    });
  }

  private addSubmissionMarker(view: esri.MapView): void {
    const graphic = {
      geometry: {
        type: 'point',
        longitude: this.submission.location.longitude,
        latitude: this.submission.location.latitude
      },
      symbol: {
        type: 'simple-marker',
        style: 'circle',
        color: [226, 119, 40],
        size: '12px',
        outline: {
          color: [255, 255, 255],
          width: 2
        }
      }
    } as esri.GraphicProperties;

    view.graphics.add(graphic as esri.Graphic);
  }

  public setValidationStatus(status: COMPETITION_VALIDATION_STATUS): void {
    this.submissionService
      .validateSubmission({
        guid: this.submission.guid,
        status
      })
      .pipe(
        tap(() => {
          this.submission.validationStatus = status;
          this.ns.toast({
            id: 'validation-success',
            title: 'Success',
            message: 'Submission validation status updated successfully'
          });
          this.modalRef.close(this.submission);
        })
      )
      .subscribe({
        error: (err) => {
          this.ns.toast({
            id: 'validation-error',
            title: 'Error',
            message: `Failed to update validation status: ${err.message}`
          });
        }
      });
  }

  public close(): void {
    this.modalRef.close();
  }

  private createImageUrl(
    blobData: Blob | ArrayBuffer | number[] | { type: string; data: number[] },
    mimeType?: string
  ): SafeUrl {
    if (blobData) {
      try {
        // Convert the blob data to a proper Blob
        let blob: Blob;

        if (blobData instanceof Blob) {
          blob = blobData;
        } else if (blobData instanceof ArrayBuffer) {
          blob = new Blob([blobData], { type: mimeType || 'image/jpeg' });
        } else if (Array.isArray(blobData)) {
          // If it's an array of bytes
          const uint8Array = new Uint8Array(blobData);
          blob = new Blob([uint8Array], { type: mimeType || 'image/jpeg' });
        } else if (
          typeof blobData === 'object' &&
          'type' in blobData &&
          blobData.type === 'Buffer' &&
          'data' in blobData &&
          Array.isArray(blobData.data)
        ) {
          // If it's a Buffer serialized as JSON from Node.js
          const uint8Array = new Uint8Array(blobData.data);
          blob = new Blob([uint8Array], { type: mimeType || 'image/jpeg' });
        } else {
          console.error('Unsupported blob data type:', typeof blobData, blobData);
          return '';
        }

        const imageUrl = window.URL.createObjectURL(blob);
        return this.sanitizer.bypassSecurityTrustUrl(imageUrl);
      } catch (err) {
        console.error('Error creating image URL:', err);
        return '';
      }
    }
    return '';
  }
}

export interface SubmissionDetailModalData {
  submission: SubmissionReviewDto;
  isAdmin: boolean;
}
