import { Request } from 'express';

import { Inject, Injectable } from '@nestjs/common';
import { DataTaskStatus } from '@tamu-gisc/veoride/common/entities';

import { DATASETS_STORE } from '../../interfaces/module-registration.interface';
import { DataTaskPayloadDto, TasksService } from '../tasks/tasks.service';

@Injectable()
export class TripsService {
  public resource_name = 'trips';

  constructor(
    @Inject(DATASETS_STORE) private readonly datasetsLocation: string,
    private readonly tasksService: TasksService
  ) {}

  public async requestStatusChangeData(params: GetTripsDto, req: Request): Promise<DataTaskPayloadDto> {
    // Remove access_token if it's that auth strategy is used
    const shallow_params = { ...params.queryParams };
    delete shallow_params['access_token'];

    const request = await this.tasksService.findOrCreate({
      resourceName: this.resource_name,
      resourceParams: JSON.stringify(params.queryParams),
      userGuid: params.userId
    });

    const dto = TasksService.taskToDto(request);

    if (request.status === DataTaskStatus.COMPLETE) {
      dto.url = dto.url = `${req.protocol}://${req.get('host')}${req.path}/${request.id}`;
    } else {
      dto.url = null;
    }

    return dto;
  }

  public fetchDatasetDiskPath(id: string): string {
    return `${this.datasetsLocation}/${id}.json`;
  }
}

interface GetTripsDto {
  queryParams: { [key: string]: string | number | boolean };
  userId: string;
}
