import { Injectable } from '@nestjs/common';
import { DataTaskStatus } from '@tamu-gisc/veoride/common/entities';

import { DataTaskPayloadDto, TasksService } from '../tasks/tasks.service';

@Injectable()
export class StatusChangesService {
  public resource_name = 'status_changes';

  constructor(private readonly tasksService: TasksService) {}

  public async requestStatusChangeData(params: GetStatusChangesDto): Promise<DataTaskPayloadDto> {
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

interface GetStatusChangesDto {
  queryParams: string;
  userId: string;
}
