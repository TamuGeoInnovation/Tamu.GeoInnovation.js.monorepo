import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { SessionSlidesDto, SpeakerSessionDto, SubmissionFileDto } from '@tamu-gisc/gisday/common';

/**
 * The slides of the sessions speakers present (#3093): the speaker's own, through their edit link with no sign-in, and
 * the admins' view of every session's.
 */
@Injectable({ providedIn: 'root' })
export class SessionFilesService {
  private readonly http = inject(HttpClient);
  private readonly resource = inject(EnvironmentService).value('api_url') + '/session-files';

  /** The sessions the link's speaker presents this season, each with its slides. */
  public forLink(token: string) {
    return this.http.get<Array<SpeakerSessionDto>>(this.link(token));
  }

  /** Uploads, or replaces, a session's slides, reporting the upload's progress as it goes. */
  public upload(token: string, eventGuid: string, file: File): Observable<HttpEvent<SubmissionFileDto>> {
    const body = new FormData();

    body.append('file', file, file.name);

    return this.http.post<SubmissionFileDto>(`${this.link(token)}/${eventGuid}`, body, {
      reportProgress: true,
      observe: 'events'
    });
  }

  public remove(token: string, eventGuid: string) {
    return this.http.delete<void>(`${this.link(token)}/${eventGuid}`);
  }

  /** A session's slides, for its admin page. */
  public forEvent(eventGuid: string) {
    return this.http.get<Array<SubmissionFileDto>>(`${this.resource}/event/${eventGuid}`);
  }

  /** One file's contents, to save under its own name. */
  public download(eventGuid: string, fileGuid: string) {
    return this.http.get(`${this.resource}/event/${eventGuid}/${fileGuid}`, { responseType: 'blob' });
  }

  /** The slides of a season's sessions that have some, for the admins' list. */
  public forSeason(seasonGuid: string) {
    return this.http.get<Array<SessionSlidesDto>>(`${this.resource}/season/${seasonGuid}`);
  }

  private link(token: string): string {
    return `${this.resource}/link/${encodeURIComponent(token)}`;
  }
}
