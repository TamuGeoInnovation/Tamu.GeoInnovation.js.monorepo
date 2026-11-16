import { Provider } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ReviewEmailSession } from '@tamu-gisc/gisday/common';

import { CompetitionSessionsService } from './competition-session.component';

/** The season's competition and awards sessions as production had them on 15 November 2026 (#3011). */
export const COMPETITION_SESSIONS: Array<ReviewEmailSession> = [
  session('u', 'COMPETITION: Undergraduate Research Competition', '14:00:00', '14:40:00', '2026-11-17'),
  session('g', 'COMPETITION: Graduate Student Research', '14:40:00', '16:00:00', '2026-11-17'),
  session('p', 'COMPETITION: Student Poster Competition', '16:15:00', '17:15:00', '2026-11-17'),
  session(
    'a',
    'AWARDS: Student Presentation & Poster Competition Winner Announcements',
    '13:00:00',
    '13:15:00',
    '2026-11-19'
  )
];

function session(guid: string, name: string, startTime: string, endTime: string, date: string): ReviewEmailSession {
  return {
    guid,
    name,
    startTime,
    endTime,
    // A season day is stored at midnight Central.
    day: { date: `${date}T06:00:00.000Z` },
    location: {
      building: 'TAMU Memorial Student Center',
      room: date === '2026-11-19' ? 'Bethancourt Ballroom 2300 A&B' : 'Bethancourt Ballroom 2300 C'
    }
  };
}

/** The competition pages' sessions, without the API. */
export function provideCompetitionSessions(
  sessions: Observable<Array<ReviewEmailSession>> = of(COMPETITION_SESSIONS)
): Provider {
  return { provide: CompetitionSessionsService, useValue: { sessions$: sessions } };
}
