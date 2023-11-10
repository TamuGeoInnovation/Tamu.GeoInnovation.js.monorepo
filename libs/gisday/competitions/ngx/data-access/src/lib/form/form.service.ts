import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, pluck, tap } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { CompetitionForm, CompetitionSeason } from '@tamu-gisc/gisday/competitions/data-api';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  public resource: string;

  constructor(
    private readonly http: HttpClient,
    private readonly env: EnvironmentService,
    private readonly ns: NotificationService
  ) {
    this.resource = `${this.env.value('api_url')}/competitions/forms`;
  }

  public getFormForActiveSeason(): Observable<CompetitionForm> {
    return this.http.get<CompetitionSeason>(`${this.resource}/active`).pipe(
      pluck('form'),
      catchError((err) => {
        this.ns.toast({
          id: 'submission-form-load-failure',
          title: 'Failed to Load Season Form',
          message: `There was an error loading the competitions submission form for the active season. ${err.error.message}`
        });

        throw new Error(`Failed loading season form.`);
      })
    );
  }

  public getFormForSeason(seasonName: string): Observable<CompetitionForm> {
    return this.http.get<CompetitionSeason>(`${this.resource}/${seasonName}`).pipe(
      pluck('form'),
      catchError((err) => {
        this.ns.toast({
          id: 'submission-form-load-failure',
          title: 'Failed to Load Season Form',
          message: `There was an error loading the competitions submission form for this season. ${err.error.message}`
        });

        throw new Error(`Failed loading season form.`);
      })
    );
  }

  public saveFormModelForSeason(seasonGuid: string, form: CompetitionForm) {
    return this.http.post(`${this.resource}/${seasonGuid}`, form).pipe(
      catchError((err) => {
        this.ns.toast({
          id: 'submission-form-save-failure',
          title: 'Failed to Save Season Form',
          message: `There was an error saving the competitions submission form for this season.  ${err.error.message}`
        });

        throw new Error('Failed saving season form');
      })
    );
  }

  public createFormModelForActiveSeason(form: CompetitionForm) {
    return this.http.post(`${this.resource}/active`, form).pipe(
      tap(() => {
        this.ns.toast({
          id: 'designer-form-signed',
          message: 'Form was saved successfully.',
          title: 'Form Saved'
        });
      }),
      catchError((err) => {
        this.ns.toast({
          id: 'submission-form-create-failure',
          title: 'Failed to Create Form For Season',
          message: `There was an error saving the competitions submission form for this season. ${err.error.message}`
        });

        throw new Error('Failed saving season form');
      })
    );
  }
}
