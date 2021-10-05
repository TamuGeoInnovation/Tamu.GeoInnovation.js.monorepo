import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Log } from '@tamu-gisc/veoride/common/entities';

@Injectable()
export class LogsService {
  constructor(@InjectRepository(Log) private readonly repo: Repository<Log>) {}

  public getLatestForResource(params: GetLogsForResourceDto) {
    const qb = Log.createQueryBuilder('log');

    qb.where('log.resource = :resource', { resource: params.resource });

    qb.limit(params.limit ? params.limit : 100);

    qb.orderBy('log.created', 'DESC');

    return qb.getMany();
  }
}

export interface GetLogsForResourceDto extends Partial<Log> {
  limit: number;
}
