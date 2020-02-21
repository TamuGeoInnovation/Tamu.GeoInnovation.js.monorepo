import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Observable, of } from 'rxjs';
import { pluck } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AccountSecurityService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = `${this.env.value('api_url')}`;
  }

  /**
   * Gets a list of available security/secret questions.
   */
  public getSecretQuestions(): Observable<Array<ISecretQuestion>> {
    return this.http
      .get<ISecretQuestions>(`${this.resource}getSecretQuestions`, { withCredentials: true })
      .pipe(pluck<ISecretQuestions, Array<ISecretQuestion>>('items'));
  }

  /**
   * Gets logged in user active security/secret question.
   */
  public getActiveSecretQuestion(): Observable<IActiveSecretQuestion> {
    return this.http.get<IActiveSecretQuestion>(`${this.resource}getSecretQuestion`, { withCredentials: true });
  }
}

export interface ISecretQuestion {
  Id: string;
  Question: string;
}

export interface ISecretQuestions {
  items: Array<ISecretQuestion>;
}

export interface IActiveSecretQuestion {
  Status: string;
  Question: string;
}
