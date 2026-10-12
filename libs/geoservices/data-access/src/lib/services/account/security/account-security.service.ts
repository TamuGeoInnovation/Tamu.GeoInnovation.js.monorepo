import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountSecurityService {
  private env = inject(EnvironmentService);
  private http = inject(HttpClient);

  public resource: string;

  constructor() {
    this.resource = `${this.env.value('legacy_api_url')}`;
  }

  /**
   * Gets a list of available security/secret questions.
   */
  public getSecretQuestions(): Observable<Array<ISecretQuestion>> {
    return this.http
      .get<ISecretQuestions>(`${this.resource}getSecretQuestions`, { withCredentials: true })
      .pipe(map((questions) => questions.items));
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
