import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, getRepository, DeepPartial } from 'typeorm';

import { Response, Workshop, Scenario } from '@tamu-gisc/cpa/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class ResponsesService extends BaseService<Response> {
  constructor(@InjectRepository(Response) private repo: Repository<Response>) {
    super(repo);
  }

  public async getAllForBoth(params) {
    return await this.repo
      .createQueryBuilder('r')
      .where('r.workshopGuid = :w AND r.scenarioGuid = :s', {
        w: params.workshopGuid,
        s: params.scenarioGuid
      })
      .getMany();
  }

  public async getSpecific(params: IResponseRequestPayload) {
    return await this.getOne({ where: { guid: params.guid }, relations: ['scenario'] });
  }

  public async updateExisting(params: IResponseRequestPayload, body: IResponseRequestPayload) {
    return await this.repo.update({ guid: params.guid }, { ...body });
  }

  public async deleteExisting(params: IResponseRequestPayload) {
    return await this.repo.delete({ guid: params.guid });
  }

  public async insertNew(body: IResponseRequestPayload) {
    const existing = await this.getOne({ where: { guid: body.guid } });

    if (existing === undefined) {
      const workshop = await getRepository(Workshop).findOne({ guid: body.workshopGuid });
      const scenario = await getRepository(Scenario).findOne({ guid: body.scenarioGuid });

      if (workshop && scenario) {
        const entity = { ...body, workshop, scenario };

        return this.createOne(entity);
      } else {
        throw new HttpException('Missing resource.', 404);
      }
    } else {
      throw new HttpException('Internal server error.', 500);
    }
  }
}

export interface IResponseResponse extends DeepPartial<Response> {}

export interface IResponseRequestPayload extends Omit<IResponseResponse, 'shapes'> {
  scenarioGuid?: string;
  workshopGuid?: string;
  shapes: object;
}
