import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, forkJoin, from, merge, Observable, ReplaySubject, Subject } from 'rxjs';
import { filter, map, pluck, shareReplay, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { DeepPartial } from 'typeorm';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import {
  CompetitionForm,
  CompetitionSubmission,
  ICompetitionSeasonFormQuestion,
  VALIDATION_STATUS
} from '@tamu-gisc/gisday/competitions/data-api';
import { FeatureSelectorService } from '@tamu-gisc/maps/feature/feature-selector';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';

import { ViewerService } from '../../services/viewer.service';

@Component({
  selector: 'tamu-gisc-submission-review',
  templateUrl: './submission-review.component.html',
  styleUrls: ['./submission-review.component.scss'],
  providers: [FeatureSelectorService]
})
export class SubmissionReviewComponent implements OnInit, OnDestroy {
  public form: Observable<DeepPartial<CompetitionForm>>;

  private _$submissionGuid: ReplaySubject<string> = new ReplaySubject();
  public submissionDetails: Observable<CompetitionSubmission>;
  public submissionStatus: Observable<string>;
  public submissionImage: Observable<SafeUrl>;

  public mergedSubmission: Observable<Array<MappedKeyedSubmissionResponse>>;

  private _$destroy: Subject<boolean> = new Subject();
  private $_refresh: Subject<boolean> = new Subject();

  constructor(
    private readonly fss: FeatureSelectorService,
    private readonly vs: ViewerService,
    private readonly ss: SubmissionService,
    private readonly sanitizer: DomSanitizer,
    private readonly settings: SettingsService,
    private readonly env: EnvironmentService
  ) {}

  public ngOnInit(): void {
    this.fss.feature
      .pipe(
        // Filter out all graphics from the submissions-layer. We are not interesting in anything
        // from the base map or other layers that arcgis uses by default.
        switchMap((graphics) =>
          from(graphics).pipe(
            filter((g) => g.layer.id === 'submissions-layer'),
            take(1)
          )
        ),
        takeUntil(this._$destroy)
      )
      .subscribe((res) => {
        this._$submissionGuid.next(res.attributes.guid);
      });

    this.submissionDetails = this._$submissionGuid.pipe(
      switchMap((guid) => {
        return this.ss.getSubmissionDetails(guid).pipe(shareReplay());
      })
    );

    this.submissionStatus = merge(
      this.submissionDetails,
      this.$_refresh.pipe(
        switchMap(() =>
          this._$submissionGuid.pipe(
            take(1),
            switchMap((guid) => {
              return this.ss.getSubmissionDetails(guid);
            })
          )
        )
      )
    ).pipe(
      pluck('validationStatus'),
      map((status: CompetitionSubmission['validationStatus']) => {
        if (!status) {
          return null;
        }

        return status.status;
      })
    );

    this.submissionImage = this._$submissionGuid.pipe(
      switchMap((guid) => {
        // Two emissions from the one source. The first is a signal used to clear the image preview
        // while the image is being downloaded.
        // The second is the actual image blob.
        return this.ss.getImage(guid).pipe(startWith(false));
      }),
      map((blob) => {
        if (blob) {
          const urlCreator = window.URL || window.webkitURL;
          const imageUrl = urlCreator.createObjectURL(blob);

          return this.sanitizer.bypassSecurityTrustUrl(imageUrl);
        } else {
          return '';
        }
      }),
      shareReplay()
    );

    this.mergedSubmission = combineLatest([
      this.vs.seasonForm.pipe(pluck<CompetitionForm, Array<ICompetitionSeasonFormQuestion>>('model')),
      this.submissionDetails.pipe(pluck('value'))
    ]).pipe(
      map(([formQuestions, formResponses]) => {
        return (
          Object.entries(formResponses)
            .map(([key, value]) => {
              const q = formQuestions.find((question) => question.attribute === key);

              // If the question is undefined, this means the response model does not contain an answer
              // for the current attribute key. This can be due to a change in the form over time.
              if (!q) {
                return;
              }

              return {
                attribute: q.attribute,
                question: q.title,
                answer: value
              };
            })
            // Filter out the attributes that were not found in the response
            .filter((mapped) => mapped)
        );
      })
    );
  }

  public updateValidationStatus(status: VALIDATION_STATUS) {
    forkJoin([
      this.submissionDetails.pipe(take(1)),
      this.settings.getSimpleSettingsBranch(this.env.value('LocalStoreSettings').subKey).pipe(
        take(1),
        pluck('guid'),
        filter((guid) => {
          return guid !== undefined;
        })
      )
    ])
      .pipe(
        switchMap(([details, userGuid]) => {
          return this.ss.validateSubmission({ guid: details.guid, status, userGuid: userGuid as string });
        }),
        tap((res) => {
          this.$_refresh.next();
        })
      )
      .subscribe((status) => {
        console.log(status);
      });
  }

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }
}

interface MappedKeyedSubmissionResponse {
  question: string;
  answer: string;
  attribute: string;
}
