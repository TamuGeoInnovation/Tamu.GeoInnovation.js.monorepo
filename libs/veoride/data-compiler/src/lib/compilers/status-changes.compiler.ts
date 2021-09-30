import { SelectQueryBuilder } from 'typeorm';

import { DataTask, StatusChange } from '@tamu-gisc/veoride/common/entities';

import { AbstractVeorideDataCompiler } from './abstract.compiler';

export class VeorideStatusChangesCompiler extends AbstractVeorideDataCompiler<StatusChange> {
  constructor(public task: DataTask) {
    super(task, StatusChange, 'status_change');
  }
  public select(builder: SelectQueryBuilder<StatusChange>, params: IStatusChangesQueryParams) {
    builder
      .where(`${this.alias}.event_time <= :time`, { time: params.event_time })
      .orderBy(`${this.alias}.event_time`, 'ASC');

    return builder;
  }
}

interface IStatusChangesQueryParams {
  event_time: number;
}
