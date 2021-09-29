import { Injectable } from '@nestjs/common';
import { DataTaskStatus } from '@tamu-gisc/veoride/common/entities';

import { DataTaskPayloadDto, TasksService } from '../tasks/tasks.service';

@Injectable()
export class TripsService {
  public resource_name = 'trips';

  constructor(private readonly tasksService: TasksService) {}

  public async requestStatusChangeData(params: GetTripsDto): Promise<DataTaskPayloadDto> {
    const request = await this.tasksService.findOrCreate({
      resourceName: this.resource_name,
      resourceParams: params.queryParams,
      userGuid: params.userId
    });

    const dto = TasksService.taskToDto(request);

    if (request.status === DataTaskStatus.COMPLETE) {
      dto.url = null;
    } else {
      dto.url = null;
    }

    return dto;
  }
}

interface GetTripsDto {
  queryParams: string;
  userId: string;
}
