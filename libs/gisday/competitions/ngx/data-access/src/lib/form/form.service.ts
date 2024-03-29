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

  public getFormForActiveSeason(): Observable<CompetitionSeason> {
    return this.http.get<CompetitionSeason>(`${this.resource}/active`).pipe(
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

  public updateForm(formGuid: string, data: { form: Partial<CompetitionForm>; season: Partial<CompetitionSeason> }) {
    return this.http.patch(`${this.resource}/${formGuid}`, data).pipe(
      tap(() => {
        this.ns.toast({
          id: 'designer-form-update-success',
          message: 'Competition form was updated successfully.',
          title: 'Update Form'
        });
      }),
      catchError((err) => {
        this.ns.toast({
          id: 'submission-form-save-failure',
          title: 'Failed to Update Season Form',
          message: `There was an error updating the competitions submission form for season.  ${err.error.message}`
        });

        throw new Error('Failed updating season form');
      })
    );
  }

  public createFormModelForActiveSeason(data: { form: Partial<CompetitionForm>; season: Partial<CompetitionSeason> }) {
    return this.http.post(`${this.resource}/active`, data).pipe(
      tap(() => {
        this.ns.toast({
          id: 'designer-form-signed-success',
          message: 'Form was created successfully.',
          title: 'Create form'
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
