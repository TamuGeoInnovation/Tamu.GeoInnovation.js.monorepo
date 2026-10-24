import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { access, mkdir, writeFile } from 'fs/promises';
import { dirname, join, normalize } from 'path';
import { DataSource, EntityManager, EntityMetadata, EntityTarget, In, ObjectLiteral } from 'typeorm';

import {
  Asset,
  Event,
  EventBroadcast,
  EventLocation,
  Organization,
  Place,
  PlaceLink,
  Season,
  SeasonDay,
  Speaker,
  Tag,
  University
} from '../entities/all.entity';
import {
  SITE_COPY_KINDS,
  SiteCopyFile,
  SiteCopyKind,
  SiteCopyKindPlan,
  SiteCopyPlan,
  SiteCopyRecord,
  SiteCopyRecords
} from './site-copy.format';

/**
 * How each kind of record is copied (#2078).
 *
 * - `links`: the single links it carries, by property name, written as `{ guid }`.
 * - `lists`: the many-to-many links it carries, written as `[{ guid }]`.
 * - `leaveOut`: columns that never leave the site. People's contact details stay where they were given: a
 *   speaker's email, and an organization's contact person. So do a broadcast's host link and password,
 *   which run the meeting; its public link, meeting id and dial-in number are what attendees see anyway.
 *   A speaker's `accountGuid` links them to an account on this site only.
 *
 * Anything not named here stays behind: accounts, registrations, check-ins, classes, submissions,
 * sponsors and survey answers.
 */
interface KindRule {
  entity: EntityTarget<ObjectLiteral>;
  links: Array<string>;
  lists?: Array<string>;
  leaveOut?: Array<string>;
  /** The name a person reading the plan recognises the record by. */
  label: (record: SiteCopyRecord) => string;
}

const RULES: Record<SiteCopyKind, KindRule> = {
  seasons: { entity: Season, links: [], label: (r) => `${r.year}` },
  seasonDays: { entity: SeasonDay, links: ['season'], label: (r) => `${r.date}` },
  places: { entity: Place, links: ['season'], label: (r) => `${r.name}` },
  placeLinks: { entity: PlaceLink, links: ['place'], label: (r) => `${r.label}` },
  organizations: {
    entity: Organization,
    links: ['season'],
    leaveOut: ['contactFirstName', 'contactLastName', 'contactEmail'],
    label: (r) => `${r.name}`
  },
  universities: { entity: University, links: ['season'], label: (r) => `${r.name}` },
  eventLocations: {
    entity: EventLocation,
    links: ['place', 'season'],
    label: (r) => [r.building, r.room].filter(Boolean).join(' ')
  },
  eventBroadcasts: {
    entity: EventBroadcast,
    links: ['season'],
    leaveOut: ['presenterUrl', 'password'],
    label: (r) => `${r.name}`
  },
  tags: { entity: Tag, links: ['season'], label: (r) => `${r.name}` },
  speakers: {
    entity: Speaker,
    links: ['season', 'organization', 'university'],
    leaveOut: ['email', 'accountGuid'],
    label: (r) => [r.firstName, r.lastName].filter(Boolean).join(' ')
  },
  events: {
    entity: Event,
    links: ['day', 'season', 'location', 'broadcast'],
    lists: ['speakers', 'tags'],
    label: (r) => `${r.name}`
  },
  assets: { entity: Asset, links: ['places', 'organization', 'speaker'], label: (r) => `${r.path}` }
};

/** How many logos and photos an import fetches from the source at once. */
const FILE_FETCHES_AT_ONCE = 4;

/** The kind each link points at, so an import can check the record it names exists. */
const LINK_KINDS: Record<string, SiteCopyKind> = {
  season: 'seasons',
  day: 'seasonDays',
  place: 'places',
  places: 'places',
  location: 'eventLocations',
  broadcast: 'eventBroadcasts',
  organization: 'organizations',
  university: 'universities',
  speaker: 'speakers',
  speakers: 'speakers',
  tags: 'tags'
};

/** Columns every record has that describe this site's copy, not the record. */
const ALWAYS_LEAVE_OUT = ['created', 'updated'];

@Injectable()
export class SiteCopyService {
  private readonly _assetsDir = `${process.env.APP_DATA}`;

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /**
   * One season and what its events bring: its days, tags, organizations (places) and their links, its
   * events, the events' speakers (without their contact details) with their affiliations and universities,
   * the venues and broadcasts the events use, and the logos and photos of all of those.
   */
  public async export(seasonGuid: string, source: string): Promise<SiteCopyFile> {
    const em = this.dataSource.manager;
    const season = await em.findOne(Season, { where: { guid: seasonGuid } });

    if (!season) {
      throw new NotFoundException(`No season ${seasonGuid}.`);
    }

    const bySeason = { season: { guid: seasonGuid } };
    const records = {} as SiteCopyRecords;
    const guids = (list: Array<SiteCopyRecord>) => list.map((r) => r.guid);
    const linked = (list: Array<SiteCopyRecord>, link: string) => [
      ...new Set(list.flatMap((r) => [r[link]].flat() as Array<{ guid: string } | null>).filter(Boolean).map((r) => r.guid))
    ];
    const byGuid = async (kind: SiteCopyKind, wanted: Array<string>) =>
      wanted.length ? this.find(em, kind, { guid: In(wanted) }) : [];

    records.seasons = [this.toRecord(em, 'seasons', season)];

    // The season's own: its days, its tags (the Sessions filters), and its organizations (the homepage's and
    // About's Participating Organizations).
    for (const kind of ['seasonDays', 'places', 'tags', 'events'] as const) {
      records[kind] = await this.find(em, kind, bySeason);
    }

    // Then only what the events bring, not everyone the season has ever had: their speakers, the speakers'
    // affiliations and universities, and the venues and broadcasts they use. Fewer people's details move.
    records.speakers = await byGuid('speakers', linked(records.events, 'speakers'));
    records.organizations = await byGuid('organizations', linked(records.speakers, 'organization'));
    records.universities = await byGuid('universities', linked(records.speakers, 'university'));
    records.eventLocations = await byGuid('eventLocations', linked(records.events, 'location'));
    records.eventBroadcasts = await byGuid('eventBroadcasts', linked(records.events, 'broadcast'));

    // A venue's place, when it is not one of the season's.
    const venuePlaces = linked(records.eventLocations, 'place').filter((g) => !guids(records.places).includes(g));
    records.places.push(...(await byGuid('places', venuePlaces)));

    const placeGuids = guids(records.places);
    records.placeLinks = placeGuids.length ? await this.find(em, 'placeLinks', { place: { guid: In(placeGuids) } }) : [];

    const owners = [
      ['places', placeGuids],
      ['organization', guids(records.organizations)],
      ['speaker', guids(records.speakers)]
    ] as const;

    records.assets = [];

    for (const [property, guids] of owners) {
      if (guids.length) {
        records.assets.push(...(await this.find(em, 'assets', { [property]: { guid: In([...guids]) } })));
      }
    }

    return {
      format: 'gisday-site-copy',
      version: 1,
      source,
      exportedAt: new Date().toISOString(),
      year: season.year,
      records
    };
  }

  /**
   * Compares a file with this site and, when `apply` is true and nothing blocks it, writes it: records this
   * site does not have are added, records it has with different values are updated, by guid. Nothing here
   * is ever deleted. Logos and photos are fetched from the file's source site and written to this one.
   */
  public async import(file: SiteCopyFile, apply: boolean): Promise<SiteCopyPlan> {
    this.check(file);

    const blockers = await this.blockers(file);
    const go = apply && blockers.length === 0;
    const kinds: Array<SiteCopyKindPlan> = [];
    const warnings: Array<string> = [];
    const inFile = new Map(SITE_COPY_KINDS.map((k) => [k, new Set((file.records[k] ?? []).map((r) => r.guid))]));

    const run = async (em: EntityManager) => {
      for (const kind of SITE_COPY_KINDS) {
        kinds.push(await this.importKind(em, kind, file.records[kind] ?? [], go, inFile, warnings));
      }
    };

    if (go) {
      await this.dataSource.transaction(run);
    } else {
      await run(this.dataSource.manager);
    }

    const missing = await this.missingFiles(file);
    const files = go ? { missing: missing.length, ...(await this.copyFiles(file.source, missing)) } : { missing: missing.length, written: 0, failed: [] };

    return { applied: go, blockers, warnings, kinds, files };
  }

  private check(file: SiteCopyFile) {
    if (file?.format !== 'gisday-site-copy' || file.version !== 1 || !file.records) {
      throw new BadRequestException('This is not a GIS Day site copy file.');
    }

    if (!/^https:\/\/[^/]+$/.test(file.source ?? '') && !/^http:\/\/localhost(:\d+)?$/.test(file.source ?? '')) {
      throw new BadRequestException('The file does not say which site it came from.');
    }
  }

  /**
   * A season for the same year that is not the file's would leave this site with two of them, and its
   * events would land on neither cleanly. That is refused; the person decides which to keep.
   */
  private async blockers(file: SiteCopyFile): Promise<Array<string>> {
    const blockers: Array<string> = [];

    for (const season of file.records.seasons ?? []) {
      const sameYear = await this.dataSource.manager.find(Season, { where: { year: season.year as number } });

      if (sameYear.some((s) => s.guid !== season.guid)) {
        blockers.push(
          `This site already has a ${season.year} season that did not come from this file. Delete it, or import into a site without one.`
        );
      }
    }

    return blockers;
  }

  private async importKind(
    em: EntityManager,
    kind: SiteCopyKind,
    incoming: Array<SiteCopyRecord>,
    apply: boolean,
    inFile: Map<SiteCopyKind, Set<string>>,
    warnings: Array<string>
  ) {
    const rule = RULES[kind];
    const plan: SiteCopyKindPlan = { kind, added: [], updated: [], unchanged: 0 };

    if (incoming.length === 0) {
      return plan;
    }

    const existing = new Map(
      (await this.find(em, kind, { guid: In(incoming.map((r) => r.guid)) })).map((r) => [r.guid, r])
    );

    for (const record of incoming) {
      const clean = await this.withoutMissingLinks(em, kind, this.clean(em, kind, record), inFile, warnings);
      const have = existing.get(record.guid);

      if (!have) {
        plan.added.push(rule.label(clean));
      } else if (JSON.stringify(this.sorted(have)) !== JSON.stringify(this.sorted(clean))) {
        plan.updated.push(rule.label(clean));
      } else {
        plan.unchanged++;
        continue;
      }

      if (apply) {
        await em.save(rule.entity, this.toEntity(em, kind, clean));
      }
    }

    return plan;
  }

  /**
   * Drops a link to a record that is neither in the file nor on this site, which the database would refuse,
   * and says so in the plan.
   */
  private async withoutMissingLinks(
    em: EntityManager,
    kind: SiteCopyKind,
    record: SiteCopyRecord,
    inFile: Map<SiteCopyKind, Set<string>>,
    warnings: Array<string>
  ): Promise<SiteCopyRecord> {
    const rule = RULES[kind];
    const exists = async (link: string, guid: string) =>
      inFile.get(LINK_KINDS[link])?.has(guid) || (await em.count(RULES[LINK_KINDS[link]].entity, { where: { guid } })) > 0;

    for (const link of rule.links) {
      const value = record[link] as { guid: string } | null;

      if (value && !(await exists(link, value.guid))) {
        warnings.push(`${rule.label(record)} (${kind}): its ${link} is not in the file or on this site, so it is left out.`);
        record[link] = null;
      }
    }

    for (const list of rule.lists ?? []) {
      const kept = [];

      for (const value of record[list] as Array<{ guid: string }>) {
        if (await exists(list, value.guid)) {
          kept.push(value);
        } else {
          warnings.push(`${rule.label(record)} (${kind}): one of its ${list} is not in the file or on this site, so it is left out.`);
        }
      }

      record[list] = kept;
    }

    return record;
  }

  /** The logos and photos in the file that this site does not have on disk, by path. */
  private async missingFiles(file: SiteCopyFile): Promise<Array<string>> {
    const missing: Array<string> = [];

    for (const asset of file.records.assets ?? []) {
      const path = `${asset.path ?? ''}`;
      const target = this.uploadPath(path);

      try {
        if (!target) {
          throw new Error('outside the uploads folder');
        }

        await access(target);
      } catch {
        missing.push(path);
      }
    }

    return missing;
  }

  /**
   * Fetches each missing file from the source site and writes it where this site serves its uploads, a few
   * at a time: one by one, UCGIS's first import of 71 took long enough to look stuck (#2090).
   */
  private async copyFiles(source: string, paths: Array<string>) {
    const result = { written: 0, failed: [] as Array<string> };
    const queue = [...paths];
    const worker = async () => {
      for (let path = queue.shift(); path !== undefined; path = queue.shift()) {
        await this.copyFile(source, path, result);
      }
    };

    await Promise.all(Array.from({ length: Math.min(FILE_FETCHES_AT_ONCE, queue.length) }, worker));

    return result;
  }

  private async copyFile(source: string, path: string, result: { written: number; failed: Array<string> }) {
    const target = this.uploadPath(path);

    try {
      if (!target) {
        throw new Error('outside the uploads folder');
      }

      const response = await fetch(`${source}/assets/uploads/${path.split('/').map(encodeURIComponent).join('/')}`);

      if (!response.ok) {
        throw new Error(`${response.status}`);
      }

      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, Buffer.from(await response.arrayBuffer()));
      result.written++;
    } catch (error) {
      Logger.warn(`Could not copy ${path} from ${source}: ${error}`, 'SiteCopyService');
      result.failed.push(path || '(no path)');
    }
  }

  /** Where a path is written on this site, or null for one that climbs out of the uploads folder. */
  private uploadPath(path: string): string | null {
    const target = normalize(join(this._assetsDir, path));

    return path && target.startsWith(normalize(this._assetsDir)) ? target : null;
  }

  private async find(em: EntityManager, kind: SiteCopyKind, where: object): Promise<Array<SiteCopyRecord>> {
    const rule = RULES[kind];
    const rows = await em.find(rule.entity, {
      where,
      relations: Object.fromEntries([...rule.links, ...(rule.lists ?? [])].map((name) => [name, true]))
    });

    return rows.map((row) => this.toRecord(em, kind, row));
  }

  /** A row as the file carries it: its own columns, and its links as guids. */
  private toRecord(em: EntityManager, kind: SiteCopyKind, row: ObjectLiteral): SiteCopyRecord {
    const rule = RULES[kind];
    const record: Record<string, unknown> = {};

    for (const column of this.columns(em.connection.getMetadata(rule.entity), rule)) {
      const value = row[column];
      record[column] = value instanceof Date ? value.toISOString() : value ?? null;
    }

    for (const link of rule.links) {
      record[link] = row[link]?.guid ? { guid: row[link].guid } : null;
    }

    for (const list of rule.lists ?? []) {
      record[list] = ((row[list] ?? []) as Array<{ guid: string }>).map((r) => ({ guid: r.guid })).sort((a, b) => a.guid.localeCompare(b.guid));
    }

    return record as SiteCopyRecord;
  }

  /** Keeps only what the rule allows, whatever else a file carries. */
  private clean(em: EntityManager, kind: SiteCopyKind, record: SiteCopyRecord): SiteCopyRecord {
    const rule = RULES[kind];
    const clean: Record<string, unknown> = {};

    for (const column of this.columns(em.connection.getMetadata(rule.entity), rule)) {
      clean[column] = record[column] ?? null;
    }

    for (const link of rule.links) {
      const value = record[link] as { guid?: string } | null;
      clean[link] = value?.guid ? { guid: value.guid } : null;
    }

    for (const list of rule.lists ?? []) {
      clean[list] = ((record[list] ?? []) as Array<{ guid: string }>)
        .filter((r) => r?.guid)
        .map((r) => ({ guid: r.guid }))
        .sort((a, b) => a.guid.localeCompare(b.guid));
    }

    return clean as SiteCopyRecord;
  }

  /** A record as TypeORM saves it: dates back to dates, links as references by guid. */
  private toEntity(em: EntityManager, kind: SiteCopyKind, record: SiteCopyRecord): ObjectLiteral {
    const metadata = em.connection.getMetadata(RULES[kind].entity);
    const entity: ObjectLiteral = { ...record };

    for (const column of metadata.ownColumns) {
      const value = entity[column.propertyName];

      if (typeof value === 'string' && (column.type === Date || `${column.type}`.includes('date'))) {
        entity[column.propertyName] = new Date(value);
      }
    }

    return entity;
  }

  private columns(metadata: EntityMetadata, rule: KindRule): Array<string> {
    const leaveOut = [...ALWAYS_LEAVE_OUT, ...(rule.leaveOut ?? [])];

    return metadata.ownColumns
      .filter((c) => !c.relationMetadata && !leaveOut.includes(c.propertyName))
      .map((c) => c.propertyName);
  }

  private sorted(record: Record<string, unknown>) {
    return Object.keys(record)
      .sort()
      .reduce((acc, key) => ({ ...acc, [key]: record[key] }), {});
  }
}
