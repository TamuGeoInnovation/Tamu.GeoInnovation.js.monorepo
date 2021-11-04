import { SelectQueryBuilder } from 'typeorm';

import { DataTask, Trip } from '@tamu-gisc/veoride/common/entities';

import { AbstractVeorideDataCompiler } from './abstract.compiler';

export class VeorideTripsCompiler extends AbstractVeorideDataCompiler<Trip> {
  constructor(task: DataTask) {
    super(task, Trip, 'trip');
  }
  public select(builder: SelectQueryBuilder<Trip>, params: ITripQueryParams) {
    builder.where(`${this.alias}.end_time <= :time`, { time: params.end_time }).orderBy(`${this.alias}.end_time`, 'ASC');

    return builder;
  }
}

interface ITripQueryParams {
  end_time: number;
}
