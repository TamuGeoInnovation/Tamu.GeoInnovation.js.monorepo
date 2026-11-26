import { attendanceFileName } from './class-edit.component';

/** #3627: a class's attendance export is named by its professor, and one saved without a professor's name still exports. */
describe('attendanceFileName', () => {
  it("names the file by the class's code, number, section and professor", () => {
    expect(attendanceFileName({ code: 'GEOG', number: '476', section: '500', professorName: 'Dan Goldberg' })).toBe(
      'GEOG-476-500-dan_goldberg_gisday_attendance.csv'
    );
  });

  it('names it without a professor when the class has none, rather than failing', () => {
    expect(attendanceFileName({ code: 'GEOG', number: '476' })).toBe('GEOG-476-_gisday_attendance.csv');
  });
});
