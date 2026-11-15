import { downloadFile, fileNamePart } from './download';

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
