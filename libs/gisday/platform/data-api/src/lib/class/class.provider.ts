import { Injectable, InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { catchError, concatMap, from, map, of, toArray } from 'rxjs';

import { Auth0UserProfile, ManagementService } from '@tamu-gisc/common/nest/auth';

import { Class, CheckIn, Season } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class ClassProvider extends BaseProvider<Class> {
  constructor(
    @InjectRepository(Class) private classRepo: Repository<Class>,
    @InjectRepository(CheckIn) private readonly checkinRepo: Repository<CheckIn>,
    @InjectRepository(Season) private readonly seasonRepo: Repository<Season>,
    private readonly ms: ManagementService
  ) {
    super(classRepo);
  }

  public getClassesForSeason(seasonGuid: string) {
    return this.classRepo.find({
      where: {
        season: seasonGuid
      },
      order: {
        title: 'ASC'
      }
    });
  }

  public async createClass(dto: Class) {
    const existing = await this.classRepo.findOne({
      where: {
        code: dto.code,
        number: dto.number,
        professorName: dto.professorName
      }
    });

    if (!existing) {
      delete dto.guid;
      const created = this.classRepo.create(dto);

      return created.save();
    } else {
      return existing;
    }
  }

  public async copyClassesIntoSeason(seasonGuid: string, existingEntityGuids: Array<string>) {
    const season = await this.seasonRepo.findOne({
      where: {
        guid: seasonGuid
      }
    });

    if (!season) {
      throw new UnprocessableEntityException('Season not found.');
    }

    const classes = await this.classRepo.find({
      where: {
        guid: In(existingEntityGuids)
      }
    });

    if (!classes) {
      throw new UnprocessableEntityException('Events not found.');
    }

    const newClasses = classes.map((c) => {
      delete c.guid;
      delete c.season;
      delete c.students;
      const newClass = this.classRepo.create({
        ...c,
        season: {
          guid: season.guid
        }
      });

      return newClass.save();
    });

    try {
      return Promise.all(newClasses);
    } catch (err) {
      throw new InternalServerErrorException('Could not copy classes into season');
    }
  }

  public async getClassStudents(classGuid: string) {
    const classWithStudents = await this.classRepo.findOne({
      where: {
        guid: classGuid
      },
      relations: ['students']
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
              return of({
                user_info: {
                  id: guid
                }
              } as unknown as Auth0UserProfile);
            })
          );
        }),
        map((u) => {
          return {
            gisday_id: u.user_info?.id || 'N/A',
            last_name: u.user_info?.family_name || 'N/A',
            first_name: u.user_info?.given_name || 'N/A',
            email: u.user_info?.email || 'N/A',
            uin: u.user_metadata?.education?.id || 'N/A',
            events_attended: checkinsByUser.find((c) => c.checkin_accountGuid === u.user_info.id)?.checkinCount || 0
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
