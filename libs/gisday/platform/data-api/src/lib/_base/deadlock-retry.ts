import { Logger } from '@nestjs/common';
import { DataSource, QueryFailedError, QueryRunner } from 'typeorm';

/** SQL Server's error for a deadlock victim: "Transaction ... was deadlocked ... Rerun the transaction." */
const DEADLOCK_VICTIM = 1205;

const logger = new Logger('DeadlockRetry');

/**
 * Whether a failed query was SQL Server's deadlock victim (#3082), by the error number the mssql driver reports.
 */
export function isDeadlockVictim(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) {
    return false;
  }

  const driverError = err.driverError as { number?: number; originalError?: { info?: { number?: number } } } | undefined;

  return (driverError?.number ?? driverError?.originalError?.info?.number) === DEADLOCK_VICTIM;
}

/**
 * Runs a query again when SQL Server chooses it as a deadlock victim, as the error itself asks (#3082): up to `attempts`
 * tries in all, waiting a little longer before each. Only outside a transaction: inside one, SQL Server has rolled the
 * whole transaction back, so running the one statement again would be wrong. Every other failure is passed on at once.
 *
 * Called once, on the API's data source, after the application is created; it wraps each query runner the driver makes.
 */
export function retryDeadlockVictims(dataSource: DataSource, options: { attempts?: number; waitMs?: number } = {}): void {
  const attempts = options.attempts ?? 3;
  const waitMs = options.waitMs ?? 100;
  const driver = dataSource.driver;
  const createQueryRunner = driver.createQueryRunner.bind(driver);

  driver.createQueryRunner = (...args: Parameters<typeof createQueryRunner>): QueryRunner => {
    const runner = createQueryRunner(...args);
    const query = runner.query.bind(runner) as QueryRunner['query'];

    runner.query = (async (...queryArgs: Parameters<QueryRunner['query']>) => {
      for (let attempt = 1; ; attempt++) {
        try {
          return await query(...queryArgs);
        } catch (err) {
          if (attempt >= attempts || runner.isTransactionActive || !isDeadlockVictim(err)) {
            throw err;
          }

          logger.warn(`A query was a deadlock victim (try ${attempt} of ${attempts}); running it again.`);
          await new Promise((resolve) => setTimeout(resolve, waitMs * attempt));
        }
      }
    }) as QueryRunner['query'];

    return runner;
  };
}
