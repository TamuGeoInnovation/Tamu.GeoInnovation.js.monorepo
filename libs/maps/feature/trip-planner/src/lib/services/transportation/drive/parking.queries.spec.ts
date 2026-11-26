import { makeWhere } from '@tamu-gisc/common/utils/database';

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

  /**
   * The visitor lots (#1169).
   *
   * This asked for `TS_GIS.dbo.LOTS.Visitor_Lot`, a column the Parking Lots layer no longer has - and never
   * replaced, so it could not be repaired by renaming. The layer answers a query naming it with an error, so
   * a visitor without a permit was offered nothing at all.
   *
   * The rule is the one the layer's own renderer draws by, `LotType` ending in `Visitor`: 19 of its 244 lots,
   * 6 `Garage Visitor` and 13 `Surface Visitor`. The space counts would give 26 and include lots the map does
   * not draw as visitor parking; the maintainer chose the renderer's rule on 25 November 2026.
   */
  describe('the visitor lots', () => {
    const visitorQuery = (o: ParkingOptions = options({ Use_Permit: false })) =>
      parkingQueries(o, midday).find((q) => q.searchSource === 'visitor-parking');

    it('asks for the lot types the map draws as visitor parking', () => {
      const query = visitorQuery();

      expect(query?.sqlColumns).toEqual(['GIS.TS.ParkingLots.LotType', 'GIS.TS.ParkingLots.LotType']);
      expect(query?.values).toEqual(['Garage Visitor', 'Surface Visitor']);
      expect(query?.operators).toEqual(['=', '=']);
    });

    it('builds a where clause the service can answer, joined with OR', () => {
      // Asserted as the SQL rather than as the arrays, because the arrays alone would not catch the two
      // conditions being ANDed - which matches no lot at all - or the values not being upper-cased.
      const query = visitorQuery();

      expect(makeWhere(query?.sqlColumns ?? [], (query?.values ?? []) as string[], query?.operators ?? [])).toBe(
        "GIS.TS.ParkingLots.LotType = 'GARAGE VISITOR' OR GIS.TS.ParkingLots.LotType = 'SURFACE VISITOR'"
      );
    });

    it('never names a TS_GIS.dbo.LOTS column, none of which the layer has', () => {
      // The guard rather than the fix: `UB_Lot` is the other one, and is only kept out today by include: false.
      const named = parkingQueries(options({ Use_Permit: false, Visitor_H_C: 1, UB: 3, H_C: 2 }), midday).flatMap(
        (q) => q.sqlColumns
      );

      expect(named.filter((c) => c.startsWith('TS_GIS.dbo.LOTS.'))).toEqual([]);
    });

    it('is left out for a permit holder, who is routed to their own lots instead', () => {
      expect(visitorQuery(options({ Use_Permit: true, Permit: '55' }))).toBeUndefined();
    });
  });
});
