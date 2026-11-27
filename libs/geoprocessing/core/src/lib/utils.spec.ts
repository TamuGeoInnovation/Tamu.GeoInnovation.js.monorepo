import { getXmlStatusCode } from './utils';

/**
 * The status code a geoservices XML answer carries. It was read with a lazy pattern that backtracked polynomially on a
 * long answer of unclosed tags (CodeQL js/polynomial-redos, #3776), and it took the whole match rather than the number,
 * so every XML answer read as NaN and was thrown as an error.
 */
describe('getXmlStatusCode (#3776)', () => {
  it('reads the status code from an answer', () => {
    expect(getXmlStatusCode('<Result><QueryStatusCodeValue>200</QueryStatusCodeValue></Result>')).toBe(200);
    expect(getXmlStatusCode('<QueryStatusCodeValue> 401 </QueryStatusCodeValue>')).toBe(401);
  });

  it('is NaN for an answer with no status code', () => {
    expect(getXmlStatusCode('<Result></Result>')).toBeNaN();
    expect(getXmlStatusCode('<QueryStatusCodeValue>200')).toBeNaN();
  });

  it('answers at once for a pathological answer', () => {
    const xml = '<QueryStatusCodeValue>' + '<QueryStatusCodeValue>a'.repeat(20_000);
    const start = performance.now();

    expect(getXmlStatusCode(xml)).toBeNaN();
    expect(performance.now() - start).toBeLessThan(100);
  });
});
