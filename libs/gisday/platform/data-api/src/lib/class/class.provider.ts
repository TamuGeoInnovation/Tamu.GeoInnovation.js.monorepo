import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { catchError, concatMap, from, map, of, toArray } from 'rxjs';

import { ManagementService } from '@tamu-gisc/common/nest/auth';

import { naturalOrder } from '@tamu-gisc/gisday/common';

import { Class, CheckIn, Season } from '../entities/all.entity';
import { Auth0ProfileAsRead } from '../dashboards/dashboard-profiles.service';
import { SeasonService } from '../season/season.service';
import { SeasonScopedProvider } from '../_base/season-scoped-provider';

@Injectable()
export class ClassProvider extends SeasonScopedProvider<Class> {
  protected get seasons() {
    return this.seasonService;
  }

  protected readonly recordsName = 'classes';

  protected forSeason(seasonGuid: string) {
    return this.getClassesForSeason(seasonGuid);
  }

  protected override copyOf(record: Class, season: Season) {
    // A copy is the class, not its students (#3324): as the class provider's own copy did.
    const copy = super.copyOf(record, season) as DeepPartial<Class> & { students?: unknown };

    delete copy.students;

    return copy;
  }

  constructor(
    @InjectRepository(Class) private classRepo: Repository<Class>,
    @InjectRepository(CheckIn) private readonly checkinRepo: Repository<CheckIn>,
    private readonly ms: ManagementService,
    private readonly seasonService: SeasonService
  ) {
    super(classRepo);
  }

  /**
   * A season's classes, as both class tables list them (Admin, Classes and the student's My Classes): by code (subject,
   * then course number), then section, then professor. Sorted here rather than by SQL so numbers compare as numbers
   * (GEOG 1000 after GEOG 205), which a text column cannot do.
   */
  public async getClassesForSeason(seasonGuid: string) {
    const classes = await this.classRepo.find({
      where: {
        season: { guid: seasonGuid }
      }
    });

    return classes.sort(compareClasses);
  }

  public async getClassesForActiveSeason() {
    return this.forActiveSeason();
  }

  /**
   * A class is the same class only when its code, number, section, professor and season all match, so a second
   * section, or the same class in another season, is a new class (#2538). An empty value matches only an empty
   * value: TypeORM reads an undefined condition as "anything". An exact duplicate is refused with 409, so the admin
   * form says so instead of reporting a save that did not happen.
   */
  public async createClass(dto: DeepPartial<Class>) {
    const season = dto.season as unknown as string | { guid?: string } | null | undefined;
    const seasonGuid = typeof season === 'string' ? season : season?.guid;
    const orEmpty = <T>(value: T) => (value === undefined || value === null || value === '' ? IsNull() : value);

    const existing = await this.classRepo.findOne({
      where: {
        code: orEmpty(dto.code),
        number: orEmpty(dto.number),
        section: orEmpty(dto.section),
        professorName: orEmpty(dto.professorName),
        season: seasonGuid ? { guid: seasonGuid } : IsNull()
      } as FindOptionsWhere<Class>
    });

    if (existing) {
      throw new ConflictException(
        `${[dto.code, dto.number].filter(Boolean).join(' ')} section ${dto.section || '(none)'} for ${
          dto.professorName || '(no professor)'
        } is already in this season.`
      );
    }

    delete dto.guid;
    const created = this.classRepo.create(dto);

    return created.save();
  }

  public async copyClassesIntoSeason(seasonGuid: string, existingEntityGuids: Array<string>) {
    return this.copyIntoSeason(seasonGuid, existingEntityGuids);
  }

  public async getClassStudents(classGuid: string) {
    const classWithStudents = await this.classRepo.findOne({
      where: {
        guid: classGuid
      },
      relations: { students: true }
    });

    if (!classWithStudents) {
      return [];
    }

    return classWithStudents.students;
  }

  public async getSimplifiedAttendance(classGuid: string) {
    const cl = await this.classRepo
      .createQueryBuilder('class')
      .leftJoinAndSelect('class.students', 'userClass')
      .where('class.guid = :classGuid', { classGuid })
      .getOne();

    // `getOne` resolves null for a guid that matches nothing, and reading `.students` off it threw
    // a TypeError that surfaced as 500 -- on the roster an instructor exports to mark attendance.
    // `getClassStudents` above answers an empty list for the same case.
    if (!cl) {
      return [];
    }

    const students = cl.students;
    const studentGuids = students.map((s) => s.accountGuid);

    if (students.length > 0) {
      const checkinsByUser = await this.checkinRepo
        .createQueryBuilder('checkin')
        .select('checkin.accountGuid')
        .addSelect('COUNT(checkin.guid)', 'checkinCount')
        .where('checkin.accountGuid IN (:...accountGuids)', { accountGuids: studentGuids })
        .groupBy('checkin.accountGuid')
        .getRawMany();

      const simpleRoster = from(studentGuids).pipe(
        concatMap((guid) => {
          return from(this.ms.getUserMetadata(guid, undefined, true)).pipe(
            catchError(() => {
              // What is known of an account that could not be read: its id.
              return of<Auth0ProfileAsRead>({ user_info: { id: guid } });
            })
          );
        }),
        map((u: Auth0ProfileAsRead) => {
          return {
            gisday_id: u.user_info?.id || 'N/A',
            last_name: u.user_info?.family_name || 'N/A',
            first_name: u.user_info?.given_name || 'N/A',
            email: u.user_info?.email || 'N/A',
            uin: u.user_metadata?.education?.id || 'N/A',
            events_attended: checkinsByUser.find((c) => c.checkin_accountGuid === u.user_info?.id)?.checkinCount || 0
          };
        }),
        toArray()
      );

      return simpleRoster;
    } else {
      return [];
    }
  }
}

/** Code (subject, then course number), then section, then professor; numbers as numbers, and an empty value last. */
export function compareClasses(a: Partial<Class>, b: Partial<Class>): number {
  for (const key of ['code', 'number', 'section', 'professorName'] as const) {
    const left = (a[key] ?? '').trim();
    const right = (b[key] ?? '').trim();

    if (left !== right) {
      if (!left) {
        return 1;
      }

      if (!right) {
        return -1;
      }

      const order = naturalOrder.compare(left, right);

      if (order !== 0) {
        return order;
      }
    }
  }

  return 0;
}
