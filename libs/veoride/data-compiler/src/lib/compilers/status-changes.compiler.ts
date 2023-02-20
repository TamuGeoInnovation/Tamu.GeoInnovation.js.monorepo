import { SelectQueryBuilder } from 'typeorm';

import { DataTask, StatusChange } from '@tamu-gisc/veoride/common/entities';

import { AbstractVeorideDataCompiler } from './abstract.compiler';

export class VeorideStatusChangesCompiler extends AbstractVeorideDataCompiler<StatusChange> {
  constructor(public task: DataTask) {
    super(task, StatusChange, 'status_change');
  }
  public select(builder: SelectQueryBuilder<StatusChange>, params: IStatusChangesQueryParams) {
    builder.where(`${this.alias}.event_time <= :event_time`, { event_time: params.event_time });

    if (params.event_time_start) {
      builder.andWhere(`${this.alias}.event_time >= :event_time_start`);
      builder.setParameter('event_time_start', params.event_time_start);
    }

    builder.orderBy(`${this.alias}.event_time`, 'ASC');

    return builder;
  }
}

interface IStatusChangesQueryParams {
  event_time: number;
  event_time_start?: number;
}
