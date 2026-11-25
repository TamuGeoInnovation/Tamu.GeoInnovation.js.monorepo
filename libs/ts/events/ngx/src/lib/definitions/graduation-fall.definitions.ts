import { graduationMap } from './graduation.definitions';

// Fall 2026, from the registrar's own schedule (#2754):
// graduation.tamu.edu/ceremony-information/schedule/index.html
//
// The host moved: the aggie.tamu.edu path this used to cite is retired, and so was the link every
// commencement map showed visitors (#3278). Aggie One Stop answers both with its Page Not Found.
//
// These were left on December 2025 for eleven months. Nothing caught it: the labels carry no year,
// and 17 December really was a Wednesday in 2025, so the builder read as correct. The dates are
// configuration rather than a service, so the map went on loading and drawing and the smoke suite
// went on passing.
//
// December is Central Standard Time, so each value is 06:00Z, not May's 05:00Z (#2759).
const GraduationFall = graduationMap('Fall', [
  { eventDate: '2026-12-11', value: '2026-12-11T06:00:00.000Z', label: 'Friday, December 11th' },
  { eventDate: '2026-12-12', value: '2026-12-12T06:00:00.000Z', label: 'Saturday, December 12th' }
]);

export const GraduationConfiguration = GraduationFall.configuration;
export const GraduationOptions = GraduationFall.options;
export const GraduationFallEventTs = GraduationFall.event;
