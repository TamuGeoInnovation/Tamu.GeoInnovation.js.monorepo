import { graduationMap } from './graduation.definitions';

// May is Central Daylight Time, so each value is 05:00Z, not December's 06:00Z (#2759).
const GraduationSpring = graduationMap('Spring', [
  { eventDate: '2026-05-06', value: '2026-05-06T05:00:00.000Z', label: 'Wednesday, May 6th' },
  { eventDate: '2026-05-07', value: '2026-05-07T05:00:00.000Z', label: 'Thursday, May 7th' },
  { eventDate: '2026-05-08', value: '2026-05-08T05:00:00.000Z', label: 'Friday, May 8th' },
  { eventDate: '2026-05-09', value: '2026-05-09T05:00:00.000Z', label: 'Saturday, May 9th' }
]);

export const GraduationConfiguration = GraduationSpring.configuration;
export const GraduationOptions = GraduationSpring.options;
export const GraduationSpringEventTs = GraduationSpring.event;
