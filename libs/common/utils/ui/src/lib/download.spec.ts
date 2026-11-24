import { downloadFile, fileNamePart, toCsv } from './download';

describe('downloadFile()', () => {
  it('clicks a link to the file, named as asked, and then takes the link and its address away', () => {
    const created = vi.fn(() => 'blob:file');
    const revoked = vi.fn();
    Object.assign(URL, { createObjectURL: created, revokeObjectURL: revoked });

    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    downloadFile('a,b\n1,2', 'rsvps.csv', 'text/csv');

    const clicked = click.mock.contexts[0] as HTMLAnchorElement;

    expect(created).toHaveBeenCalledWith(expect.any(Blob));
    expect(clicked.download).toBe('rsvps.csv');
    expect(clicked.href).toBe('blob:file');
    expect(clicked.isConnected).toBe(false);
    expect(revoked).toHaveBeenCalledWith('blob:file');

    click.mockRestore();
  });
});

describe('fileNamePart()', () => {
  it('keeps letters and digits, in lower case, joined by single hyphens', () => {
    expect(fileNamePart('Keynote: GIS & the City, 2026!')).toBe('keynote-gis-the-city-2026');
    expect(fileNamePart('')).toBe('');
  });
});

describe('toCsv()', () => {
  it('writes the header and rows, from arrays or from objects keyed by the columns, as Papa always has', () => {
    expect(toCsv(['a', 'b'], [[1, 'x, y'], ['say "hi"', null]])).toBe('a,b\r\n1,"x, y"\r\n"say ""hi""",');
    expect(toCsv(['b', 'a'], [{ a: 1, b: 2 }])).toBe('b,a\r\n2,1');
  });

  it('writes a cell that starts like a formula as text (#3332)', () => {
    expect(toCsv(['n'], [['=1+1'], ['+1'], ['-1'], ['@A1'], ['\tx']])).toBe(`n\r\n"'=1+1"\r\n"'+1"\r\n"'-1"\r\n"'@A1"\r\n"'\tx"`);
  });

  it('leaves a negative number a number', () => {
    expect(toCsv(['change'], [[-2]])).toBe('change\r\n-2');
  });
});
