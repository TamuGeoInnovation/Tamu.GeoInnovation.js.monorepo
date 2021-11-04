import { constants, promises } from 'fs';
import { Inject, Injectable } from '@nestjs/common';

import { DataTaskStatus } from '@tamu-gisc/veoride/common/entities';

import { BASE_URL, DATASETS_STORE } from '../../interfaces/module-registration.interface';
import { DataTaskRequestPayloadDto, DataTaskStatusPayloadDto, TasksService } from '../tasks/tasks.service';

@Injectable()
export class StatusChangesService {
  public resource_name = 'status_changes';

  constructor(
    @Inject(DATASETS_STORE) private readonly datasetsLocation: string,
    @Inject(BASE_URL) private readonly baseUrl: string,
    private readonly tasksService: TasksService
  ) {}

  public async requestStatusChangeData(params: GetStatusChangesDto): Promise<DataTaskRequestPayloadDto> {
    // Remove access_token if it's that auth strategy is used
    const shallow_params = { ...params.queryParams };
    delete shallow_params['access_token'];

    const request = await this.tasksService.repo
      .create({
        resource: this.resource_name,
        parameters: JSON.stringify(params.queryParams),
        requester: params.userId
      })
      .save();

    const dto = TasksService.toDto(request);

    dto.statusUrl = this.baseUrl + `/${this.resource_name}/${request.id}`;

    return dto;
  }

  public async retrieveDataRequestDetails(id: string): Promise<DataTaskStatusPayloadDto> {
    const task = await this.tasksService.repo.findOne({
      where: {
        id: id
      }
    });

    const dto: DataTaskStatusPayloadDto = TasksService.toDto(task);

    if (dto.status === DataTaskStatus.COMPLETE) {
      dto.downloadUrl = `${this.baseUrl}/${this.resource_name}/${dto.id}/download`;
    } else {
      dto.downloadUrl = null;
    }

    return dto;
  }

  public async fetchDatasetDiskPath(id: string): Promise<string | undefined> {
    const location = `${this.datasetsLocation}/${id}.json`;

    try {
      await promises.access(location, constants.R_OK);

      return location;
    } catch (err) {
      return undefined;
    }
  }
}

interface GetStatusChangesDto {
  queryParams: { [key: string]: string | number | boolean };
  userId: string;
}
