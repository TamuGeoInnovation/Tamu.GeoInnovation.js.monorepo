import { Logger, UnprocessableEntityException } from '@nestjs/common';
import { DeepPartial, FindOptionsRelations, FindOptionsWhere, In, Repository } from 'typeorm';

import { Season } from '../entities/all.entity';
import { SeasonService } from '../season/season.service';
import { BaseProvider } from './base-provider';
import { rethrowHttp } from './rethrow-http';

/**
 * A record without its guid and times, as a copy of it is saved: for a record and for the records it holds (#3379).
 */
export function withoutIdentity<R extends object>(record: R): R {
  const copy = { ...record } as Partial<R> & { guid?: unknown; created?: unknown; updated?: unknown };

  delete copy.guid;
  delete copy.created;
  delete copy.updated;

  return copy as R;
}

/**
 * A provider of records that belong to a season (#3324): tags, classes, broadcasts and the rest. Ten providers each
 * wrote their records for the active season and their copy into another season, and fixes reached one copy each: the
 * season-not-found guard, the nothing-found guard, the `await` that lets a failed save be caught. Here they are once.
 *
 * A provider extending it says how to read a season's records (`forSeason`) and, if a copy holds more or less than the
 * record, what a copy holds (`copyOf`). Its own named methods, which its controller calls, use these.
 */
export abstract class SeasonScopedProvider<T extends { guid: string; season?: Season }> extends BaseProvider<T> {
  constructor(protected readonly records: Repository<T>) {
    super(records);
  }

  /** The season service, under whatever name the provider holds it. */
  protected abstract get seasons(): SeasonService;

  /** What the records are called in a refusal: "tags", "classes". */
  protected abstract readonly recordsName: string;

  /** A season's records, ordered as the provider lists them. */
  protected abstract forSeason(seasonGuid: string): Promise<Array<T>>;

  /** Relations a copy needs loaded with its record, if any. */
  protected readonly copyRelations: FindOptionsRelations<T> | undefined = undefined;

  /**
   * The active season's records. With no active season, `SeasonService.findOneActive()` answers 404 itself; each copy's
   * own `throw 422 'No active season found.'` after it could never run.
   */
  public async forActiveSeason(): Promise<Array<T>> {
    const season = await this.seasons.findOneActive();

    return this.forSeason(season.guid);
  }

  /**
   * The season copies go into, or nothing if there is none. A provider whose copy needs more of the season (its days)
   * loads it here, and refuses here what it cannot copy into.
   */
  protected copyTarget(seasonGuid: string): Promise<Season | null> {
    return this.seasons.findOne({ where: { guid: seasonGuid } });
  }

  /**
   * What a copy of `record` in `season` holds: the record without its id, its times or its season. A provider whose
   * records hold others (logos, students) says what to leave out or copy too.
   */
  protected copyOf(record: T, season: Season): DeepPartial<T> {
    const copy = withoutIdentity(record) as Partial<T>;

    delete copy.season;

    return { ...copy, season } as DeepPartial<T>;
  }

  /**
   * Copies the records with these guids into the season with `seasonGuid`. Refused with 422 when the season does not
   * exist or none of the records is found (none named is none found), rather than writing records into no season or
   * answering an empty list.
   */
  public async copyIntoSeason(seasonGuid: string, guids?: Array<string>): Promise<Array<T>> {
    const season = await this.copyTarget(seasonGuid);

    if (!season) {
      throw new UnprocessableEntityException('Season not found.');
    }

    const found = await this.records.find({
      where: { guid: In(guids ?? []) } as FindOptionsWhere<T>,
      relations: this.copyRelations
    });

    if (!found || found.length === 0) {
      throw new UnprocessableEntityException(`Could not find ${this.recordsName} to copy.`);
    }

    try {
      return await this.records.save(found.map((record) => this.records.create(this.copyOf(record, season))));
    } catch (err) {
      // 422, as the university and tag copies answered; the class and location copies said 500.
      rethrowHttp(err, new UnprocessableEntityException(`Could not copy ${this.recordsName} into the season.`), () =>
        Logger.error((err as Error).message, this.constructor.name)
      );
    }
  }
}
