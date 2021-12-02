import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, from, Observable, ReplaySubject, Subject } from 'rxjs';
import { filter, map, pluck, shareReplay, startWith, switchMap, take, takeUntil } from 'rxjs/operators';
import { DeepPartial } from 'typeorm';

import { CompetitionForm, CompetitionSubmission, ICompetitionSeasonFormQuestion } from '@tamu-gisc/gisday/competitions';
import { FeatureSelectorService } from '@tamu-gisc/maps/feature/feature-selector';

import { ViewerService } from '../../services/viewer.service';
import { SubmissionService } from '../../../../../../modules/data-access/submission/submission.service';

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
  public submissionImage: Observable<SafeUrl>;

  public mergedSubmission: Observable<Array<MappedKeyedSubmissionResponse>>;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(
    private readonly fss: FeatureSelectorService,
    private readonly vs: ViewerService,
    private readonly ss: SubmissionService,
    private readonly sanitizer: DomSanitizer
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
        return this.ss.getSubmissionDetails(guid);
      }),
      shareReplay()
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
