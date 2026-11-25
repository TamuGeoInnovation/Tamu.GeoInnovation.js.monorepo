import { DataSource, QueryFailedError } from 'typeorm';

import { isDeadlockVictim, retryDeadlockVictims } from './deadlock-retry';

/**
 * #3082. SQL Server chose some of the API's reads as deadlock victims (error 1205, "Rerun the transaction."): about six in
 * twenty minutes on 15 November 2026, the active season, sponsors, a session's details and a speaker edit's approval,
 * each failing a page or an action once. A query outside a transaction is now run again, as the error asks.
 */
describe('retryDeadlockVictims', () => {
  const deadlock = () =>
    new QueryFailedError(
      'SELECT 1',
      [],
      Object.assign(new Error('Transaction (Process ID 52) was deadlocked'), { number: 1205 })
    );

  function runnerThat(...outcomes: Array<'deadlock' | 'other' | 'ok'>) {
    const query = vi.fn(async () => {
      const next = outcomes.shift();

      if (next === 'deadlock') {
        throw deadlock();
      }

      if (next === 'other') {
        throw new QueryFailedError('SELECT 1', [], Object.assign(new Error('Invalid column name'), { number: 207 }));
      }

      return [{ ok: 1 }];
    });
    const runner = { query, isTransactionActive: false };
    const dataSource = { driver: { createQueryRunner: vi.fn(() => runner) } } as unknown as DataSource;

    retryDeadlockVictims(dataSource, { waitMs: 0 });

    return { runner: dataSource.driver.createQueryRunner('master'), query };
  }

  it('runs a deadlock victim again, and answers with the rerun', async () => {
    const { runner, query } = runnerThat('deadlock', 'ok');

    await expect(runner.query('SELECT 1')).resolves.toEqual([{ ok: 1 }]);
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('gives up after three tries, with the deadlock', async () => {
    const { runner, query } = runnerThat('deadlock', 'deadlock', 'deadlock', 'ok');

    await expect(runner.query('SELECT 1')).rejects.toThrow(/deadlocked/);
    expect(query).toHaveBeenCalledTimes(3);
  });

  it('does not rerun any other failure', async () => {
    const { runner, query } = runnerThat('other', 'ok');

    await expect(runner.query('SELECT 1')).rejects.toThrow(/Invalid column name/);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('does not rerun inside a transaction, which SQL Server has rolled back whole', async () => {
    const { runner, query } = runnerThat('deadlock', 'ok');
    (runner as unknown as { isTransactionActive: boolean }).isTransactionActive = true;

    await expect(runner.query('SELECT 1')).rejects.toThrow(/deadlocked/);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('knows a deadlock by its error number, as mssql reports it', () => {
    expect(isDeadlockVictim(deadlock())).toBe(true);
    expect(
      isDeadlockVictim(
        new QueryFailedError('SELECT 1', [], Object.assign(new Error('x'), { originalError: { info: { number: 1205 } } }))
      )
    ).toBe(true);
    expect(isDeadlockVictim(new Error('deadlocked'))).toBe(false);
  });
});
