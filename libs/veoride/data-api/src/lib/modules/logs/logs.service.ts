import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Log } from '@tamu-gisc/veoride/common/entities';

@Injectable()
export class LogsService {
  constructor(@InjectRepository(Log) private readonly repo: Repository<Log>) {}

  public getLatestForResource(params: GetLogsForResourceDto) {
    const qb = Log.createQueryBuilder('log');

    if (params.resource) {
      qb.where('log.resource = :resource', { resource: params.resource });
    }

    if (params.type) {
      qb.andWhere('log.type = :type', { type: params.type });
    }

    if (params.category) {
      qb.andWhere('log.category = :category', { category: params.category });
    }

    if (params.collectedTime) {
      qb.andWhere('log.collectedTime = :collectedTime', { collectedTime: params.collectedTime });
    } else if (params.collectedTime_lte || params.collectedTime_gte) {
      if (params.collectedTime_gte) {
        qb.andWhere('log.collectedTime >= :collectedTime', { collectedTime: params.collectedTime_gte });
      }

      if (params.collectedTime_lte) {
        qb.andWhere('log.collectedTime <= :collectedTime', { collectedTime: params.collectedTime_lte });
      }
    }

    qb.limit(params.limit ? params.limit : 100);

    qb.orderBy('log.created', params.order ? params.order : 'DESC');

    return qb.getMany();
  }
}

export interface GetLogsForResourceDto extends Partial<Log> {
  limit: number;
  order: 'DESC' | 'ASC';
  collectedTime_gte: number;
  collectedTime_lte: number;
}
