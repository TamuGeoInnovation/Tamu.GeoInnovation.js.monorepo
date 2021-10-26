import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, getRepository } from 'typeorm';

import { Response, Workshop, Snapshot, Scenario, Participant } from '@tamu-gisc/cpa/common/entities';

import { BaseService } from '../base/base.service';
import { IResponseRequestDto } from './responses.controller';

@Injectable()
export class ResponsesService extends BaseService<Response> {
  constructor(@InjectRepository(Response) private repo: Repository<Response>) {
    super(repo);
  }

  public async getAllForBoth(params) {
    return await this.repo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.participant', 'participant')
      .where('r.workshopGuid = :w AND r.snapshotGuid = :s', {
        w: params.workshopGuid,
        s: params.snapshotGuid
      })
      .getMany();
  }

  public async getManyForWorkshop(params) {
    return await this.repo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.snapshot', 'snapshot')
      .leftJoinAndSelect('r.scenario', 'scenario')
      .leftJoinAndSelect('r.participant', 'participant')
      .where('r.workshopGuid = :w', {
        w: params
      })
      .getMany();
  }

  public async getSpecific(params: IResponseRequestDto) {
    return await this.getOne({ where: { guid: params.guid }, relations: ['snapshot'] });
  }

  public async updateExisting(params: IResponseRequestDto, body: IResponseRequestDto) {
    return await this.repo.update({ guid: params.guid }, { ...body });
  }

  public async deleteExisting(params: IResponseRequestDto) {
    return await this.repo.delete({ guid: params.guid });
  }

  public async insertNew(body: IResponseRequestDto) {
    // Check to see if there's an existing response for the provided participant in a given
    // workshop and scenario/snapshot
    const existing = await this.getOne({
      where: [
        {
          participant: { guid: body.participantGuid },
          workshop: { guid: body.workshopGuid },
          scenario: { guid: body.scenarioGuid }
        },
        {
          participant: { guid: body.participantGuid },
          workshop: { guid: body.workshopGuid },
          snapshot: { guid: body.snapshotGuid }
        }
      ],
      relations: ['workshop', 'scenario', 'snapshot', 'participant']
    });

    if (existing === undefined) {
      const workshop = await getRepository(Workshop).findOne({
        where: [{ guid: body.workshopGuid }, { alias: body.workshopGuid }]
      });

      const participant = await getRepository(Participant).findOne({
        where: {
          guid: body.participantGuid
        }
      });

      let snapshot;
      let scenario;

      if (body.snapshotGuid) {
        snapshot = await getRepository(Snapshot).findOne({ guid: body.snapshotGuid });
      } else if (body.scenarioGuid) {
        scenario = await getRepository(Scenario).findOne({ guid: body.scenarioGuid });
      }

      if ((workshop && snapshot) || (workshop && scenario)) {
        const entity = { ...body, workshop, snapshot, scenario, participant };

        // Prevent any unnecessary values from being set in database
        // since a response can only belong to one of a snapshot or a scenario
        if (snapshot === undefined) {
          delete entity.snapshot;
        } else if (scenario === undefined) {
          delete entity.scenario;
        }

        return this.createOne(entity);
      } else {
        throw new HttpException('Missing resource.', 404);
      }
    } else {
      throw new HttpException('Internal server error.', 500);
    }
  }
}
