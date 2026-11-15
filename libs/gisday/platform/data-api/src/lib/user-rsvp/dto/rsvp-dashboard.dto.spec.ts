import type { Auth0UserProfile } from '@tamu-gisc/common/nest/auth';

import { personOf, personTypeOf, studentLevelOf } from './rsvp-dashboard.dto';

function student(classification: string): Auth0UserProfile {
  return {
    app_metadata: { gisday: { attendeeType: 'student' } },
    user_metadata: { education: { classification, fieldOfStudy: 'Geography', institution: 'u-1' } }
  } as unknown as Auth0UserProfile;
}

describe('RSVP dashboard person types (#2878)', () => {
  describe('studentLevelOf()', () => {
    it.each(['Senior', 'junior', 'Freshman', 'Sophomore', 'Undergraduate', 'undergrad', 'U3', 'BS Geography', 'fourth year'])(
      'reads %p as undergraduate',
      (text) => {
        expect(studentLevelOf(text)).toBe('undergraduate');
      }
    );

    it.each(['Graduate', 'grad student', 'PhD', 'Ph.D.', 'Ph D candidate', "Master's", 'MS', 'G2', 'Doctoral', 'Postdoc'])(
      'reads %p as graduate',
      (text) => {
        expect(studentLevelOf(text)).toBe('graduate');
      }
    );

    it('reads "Undergraduate" as undergraduate, though it contains "graduate"', () => {
      expect(studentLevelOf('Undergraduate')).toBe('undergraduate');
    });

    it.each(['', '   ', null, undefined, 'Student', 'Other', '2027'])('reads %p as neither', (text) => {
      expect(studentLevelOf(text)).toBeNull();
    });
  });

  describe('personTypeOf()', () => {
    it('splits students by classification, and keeps one it cannot read as a student', () => {
      expect(personTypeOf(student('Senior'))).toBe('undergraduate');
      expect(personTypeOf(student('PhD'))).toBe('graduate');
      expect(personTypeOf(student('Exchange'))).toBe('student');
    });

    it('takes academia and industry as they are stored', () => {
      expect(personTypeOf({ app_metadata: { gisday: { attendeeType: 'academia' } } } as unknown as Auth0UserProfile)).toBe('academia');
      expect(personTypeOf({ app_metadata: { gisday: { attendeeType: 'industry' } } } as unknown as Auth0UserProfile)).toBe('industry');
    });

    it('counts a profile with no type, or one that could not be read, as Not given', () => {
      expect(personTypeOf({ app_metadata: {} } as unknown as Auth0UserProfile)).toBe('not-given');
      expect(personTypeOf(null)).toBe('not-given');
      expect(personTypeOf({ app_metadata: { gisday: { attendeeType: 'someone' } } } as unknown as Auth0UserProfile)).toBe('not-given');
    });
  });

  describe('personOf()', () => {
    const names = new Map([
      ['u-1', 'Texas A&M University'],
      ['o-1', 'Esri']
    ]);

    it("gives a student's classification, field of study and institution", () => {
      const profile = {
        ...student('Junior'),
        user_info: { given_name: 'Ana', family_name: 'Lee', email: 'ana@example.edu' }
      } as unknown as Auth0UserProfile;

      expect(personOf(profile, '2026-11-01T15:00:00Z', names)).toEqual({
        firstName: 'Ana',
        lastName: 'Lee',
        email: 'ana@example.edu',
        type: 'undergraduate',
        classification: 'Junior',
        department: 'Geography',
        position: null,
        organization: 'Texas A&M University',
        created: '2026-11-01T15:00:00.000Z'
      });
    });

    it("gives anyone else's position, department and employer, by name or as they typed it", () => {
      const profile = {
        user_info: { name: 'Sam Ortiz', email: 'sam@example.com' },
        app_metadata: { gisday: { attendeeType: 'industry' } },
        user_metadata: { occupation: { employer: 'o-1', department: 'Solutions', position: 'Analyst' } }
      } as unknown as Auth0UserProfile;

      expect(personOf(profile, '2026-11-02T00:00:00Z', names)).toMatchObject({
        firstName: 'Sam Ortiz',
        lastName: null,
        type: 'industry',
        classification: null,
        department: 'Solutions',
        position: 'Analyst',
        organization: 'Esri'
      });

      profile.user_metadata.occupation.employer = 'other';
      profile.user_metadata.occupation.otherEmployer = 'City of Bryan';

      expect(personOf(profile, '2026-11-02T00:00:00Z', names).organization).toBe('City of Bryan');
    });

    it('still lists someone whose profile could not be read', () => {
      expect(personOf(null, '2026-11-02T00:00:00Z', names)).toMatchObject({
        firstName: null,
        email: null,
        type: 'not-given'
      });
    });
  });
});
