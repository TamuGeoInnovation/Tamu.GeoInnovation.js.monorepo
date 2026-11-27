import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Not, Repository } from 'typeorm';

import {
  RUBRIC_COMPETITION_TYPES,
  RubricCriterionValue,
  RubricDto,
  RubricValue,
  rubricProblem
} from '@tamu-gisc/gisday/common';

import { Rubric, RubricCriterion, Season } from '../entities/all.entity';

/** A rubric as an admin sends it: for a new one, the season it is for as well. */
export type RubricBody = Partial<RubricValue> & { season?: unknown };

/** Refuses a rubric `rubricProblem` finds anything wrong with; past it, the rubric has every field it checks. */
function assertRubric<B extends RubricBody>(body: B): asserts body is B & RubricValue {
  const problem = rubricProblem(body);

  if (problem) {
    throw new BadRequestException(problem);
  }
}

/**
 * The rubrics judges score against (#3183), one per season for each judged competition type. Saving a rubric replaces its
 * criteria with those sent, in their order: a criterion sent with its id keeps it, so the scores judges gave it stay with
 * it; one left out is deleted, and a new one gets a new id. Each change is one transaction.
 */
@Injectable()
export class RubricService {
  constructor(
    @InjectRepository(Rubric) private readonly rubrics: Repository<Rubric>,
    @InjectRepository(Season) private readonly seasons: Repository<Season>
  ) {}

  /** A season's rubrics, posters first, each with its criteria in order. */
  public async forSeason(seasonGuid: string): Promise<Array<RubricDto>> {
    const rubrics = await this.rubrics.find({ where: { season: { guid: seasonGuid } }, relations: { criteria: true } });

    return rubrics
      .map(rubricDto)
      .sort(
        (a, b) =>
          RUBRIC_COMPETITION_TYPES.indexOf(a.competitionType as never) -
          RUBRIC_COMPETITION_TYPES.indexOf(b.competitionType as never)
      );
  }

  /** The season's rubric for a competition type, or null when it has none yet. */
  public async rubricFor(seasonGuid: string, competitionType: string): Promise<RubricDto | null> {
    const rubric = await this.rubrics.findOne({
      where: { season: { guid: seasonGuid }, competitionType },
      relations: { criteria: true }
    });

    return rubric ? rubricDto(rubric) : null;
  }

  /** A new rubric for a season, which must not have one for that competition type yet. */
  public async create(body: RubricBody): Promise<RubricDto> {
    assertRubric(body);

    if (typeof body.season !== 'string' || !(await this.seasons.findOne({ where: { guid: body.season } }))) {
      throw new BadRequestException('Name the season the rubric is for.');
    }

    if (await this.rubrics.findOne({ where: { season: { guid: body.season }, competitionType: body.competitionType } })) {
      throw new ConflictException(`This season already has a ${body.competitionType} rubric. Edit that one.`);
    }

    const guid = await this.rubrics.manager.transaction(async (m) => {
      const saved = await m.getRepository(Rubric).save(
        m.getRepository(Rubric).create({
          season: { guid: body.season } as Season,
          competitionType: body.competitionType,
          name: body.name.trim(),
          description: body.description?.trim() || null
        })
      );

      await replaceCriteria(m, saved.guid, body.criteria);

      return saved.guid;
    });

    return this.byGuid(guid);
  }

  /** Changes a rubric's name, description and criteria; what competition it is for stays. */
  public async update(guid: string, body: RubricBody): Promise<RubricDto> {
    const rubric = await this.rubrics.findOne({ where: { guid } });

    if (!rubric) {
      throw new NotFoundException('That rubric does not exist.');
    }

    const value = { ...body, competitionType: rubric.competitionType };

    assertRubric(value);

    await this.rubrics.manager.transaction(async (m) => {
      await m
        .getRepository(Rubric)
        // A description left out keeps the rubric's own (#3862); sent empty, it clears it, as before.
        .update(guid, {
          name: value.name.trim(),
          description: value.description === undefined ? rubric.description : value.description?.trim() || null
        });
      await replaceCriteria(m, guid, value.criteria);
    });

    return this.byGuid(guid);
  }

  /** Deletes a rubric and its criteria. Judges' scores given with it are kept, without it. */
  public async remove(guid: string): Promise<void> {
    const result = await this.rubrics.delete(guid);

    if (!result.affected) {
      throw new NotFoundException('That rubric does not exist.');
    }
  }

  private async byGuid(guid: string): Promise<RubricDto> {
    const rubric = await this.rubrics.findOne({ where: { guid }, relations: { criteria: true } });

    // Deleted since it was saved.
    if (!rubric) {
      throw new NotFoundException('That rubric does not exist.');
    }

    return rubricDto(rubric);
  }
}

/**
 * Makes a rubric's criteria those given, in their order: one given with the id of one of this rubric's keeps it, every
 * other gets a new id, and the rubric's criteria not given are deleted.
 */
async function replaceCriteria(m: EntityManager, rubricGuid: string, given: Array<RubricCriterionValue>): Promise<void> {
  const repo = m.getRepository(RubricCriterion);
  const existing = await repo.find({ where: { rubric: { guid: rubricGuid } } });
  const ids = new Set(existing.map((c) => c.guid));
  const rows = given.map((c, position) =>
    repo.create({
      // Only an id of this rubric's own: one from anywhere else would move another rubric's criterion here.
      guid: c.guid && ids.has(c.guid) ? c.guid : crypto.randomUUID(),
      rubric: { guid: rubricGuid } as Rubric,
      position,
      name: c.name.trim(),
      maxPoints: c.maxPoints,
      levels: c.levels.map((l) => ({ label: l.label.trim(), description: l.description.trim() }))
    })
  );
  const kept = rows.map((r) => r.guid);

  await repo.delete(kept.length ? { rubric: { guid: rubricGuid }, guid: Not(In(kept)) } : { rubric: { guid: rubricGuid } });
  await repo.save(rows);
}

/** A rubric as the API gives it: its criteria in order, and nothing of its season. */
export function rubricDto(rubric: Rubric): RubricDto {
  return {
    guid: rubric.guid,
    competitionType: rubric.competitionType,
    name: rubric.name,
    description: rubric.description ?? null,
    criteria: [...(rubric.criteria ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((c) => ({
        guid: c.guid,
        position: c.position,
        name: c.name,
        maxPoints: c.maxPoints,
        levels: c.levels
      }))
  };
}
