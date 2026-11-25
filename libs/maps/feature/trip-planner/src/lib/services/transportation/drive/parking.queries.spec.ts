import { ParkingOptions, parkingQueries } from './parking.service';

/**
 * What a visitor's parking choices turn into (#3605).
 *
 * The accessible-visitor-spaces option read `H_C` where it filters on `Visitor_H_C`, so it built `Visitor_H_C >= 0`,
 * which every one of the 244 lots matches. A control the visitor had deliberately set did nothing, invisibly, and
 * they were offered lots with no accessible visitor spaces at all - 226 of them.
 */
describe('parkingQueries', () => {
  const options = (overrides: Partial<ParkingOptions> = {}): ParkingOptions =>
    ({ H_C: 0, Visitor_H_C: 0, UB: 0, ...overrides }) as ParkingOptions;

  const midday = new Date('2026-11-25T12:00:00');
  const evening = new Date('2026-11-25T19:00:00');

  const forColumn = (queries: ReturnType<typeof parkingQueries>, column: string) =>
    queries.find((q) => q.sqlColumns[0] === column);

  it('asks for lots that have an accessible visitor space, not for every lot', () => {
    const visitor = options({ Use_Permit: false, Visitor_H_C: 1 });

    const query = forColumn(parkingQueries(visitor, midday), 'GIS.TS.SPC_PNT_CNT.Visitor_H_C');

    expect(query).toBeDefined();
    expect(query?.operators).toEqual(['>=']);
    // `[0]` with `>=` is what every lot matches, and is what this built before the fix.
    expect(query?.values).toEqual([1]);
  });

  it('asks the same whether or not the visitor also set the non-visitor accessible option', () => {
    // The old line read `H_C`, so it happened to be right only for a visitor who had set both - and the
    // non-visitor option is `include: false`, so nothing sets it.
    const both = options({ Use_Permit: false, Visitor_H_C: 1, H_C: 1 });

    expect(forColumn(parkingQueries(both, midday), 'GIS.TS.SPC_PNT_CNT.Visitor_H_C')?.values).toEqual([1]);
  });

  it('leaves the accessible-visitor query out when the visitor did not ask for one', () => {
    const visitor = options({ Use_Permit: false });

    expect(forColumn(parkingQueries(visitor, midday), 'GIS.TS.SPC_PNT_CNT.Visitor_H_C')).toBeUndefined();
  });

  it('leaves it out for a permit holder, who is not being routed to visitor spaces', () => {
    const permitHolder = options({ Use_Permit: true, Permit: '55', Visitor_H_C: 1 });

    expect(forColumn(parkingQueries(permitHolder, midday), 'GIS.TS.SPC_PNT_CNT.Visitor_H_C')).toBeUndefined();
  });

  it("asks for the permit holder's own lots by permit code", () => {
    const permitHolder = options({ Use_Permit: true, Permit: '55' });

    const query = forColumn(parkingQueries(permitHolder, midday), 'GIS.TS.ParkingLots.FAC_CODE');

    expect(query?.values).toEqual(['55']);
    expect(query?.operators).toEqual(['=']);
  });

  it('adds the night lots in the evening and not at midday', () => {
    const permitHolder = options({ Use_Permit: true, Permit: '55' });

    expect(forColumn(parkingQueries(permitHolder, evening), 'Night_Lot')).toBeDefined();
    expect(forColumn(parkingQueries(permitHolder, midday), 'Night_Lot')).toBeUndefined();
  });

  it('returns only the conditions that apply, never one marked include: false', () => {
    const visitor = options({ Use_Permit: false, Visitor_H_C: 1, UB: 3, H_C: 2 });

    const columns = parkingQueries(visitor, midday).map((q) => q.sqlColumns[0]);

    expect(columns).not.toContain('GIS.TS.SPC_PNT_CNT.UB');
    expect(columns).not.toContain('GIS.TS.SPC_PNT_CNT.H_C');
    expect(columns).not.toContain('TS_GIS.dbo.LOTS.UB_Lot');
  });
});
