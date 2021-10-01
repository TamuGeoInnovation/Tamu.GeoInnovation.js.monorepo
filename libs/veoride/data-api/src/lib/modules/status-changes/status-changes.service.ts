import { constants, promises } from 'fs';
import { Request } from 'express';
import { Inject, Injectable } from '@nestjs/common';

import { DataTaskStatus } from '@tamu-gisc/veoride/common/entities';

import { DATASETS_STORE } from '../../interfaces/module-registration.interface';
import { DataTaskRequestPayloadDto, DataTaskStatusPayloadDto, TasksService } from '../tasks/tasks.service';
import { getResourceBaseUrl } from '../../utils/url.utils';

@Injectable()
export class StatusChangesService {
  public resource_name = 'status_changes';

  constructor(
    @Inject(DATASETS_STORE) private readonly datasetsLocation: string,
    private readonly tasksService: TasksService
  ) {}

  public async requestStatusChangeData(params: GetStatusChangesDto, req: Request): Promise<DataTaskRequestPayloadDto> {
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

    const baseUrl = getResourceBaseUrl(req);

    dto.statusUrl = baseUrl + `/${request.id}`;

    return dto;
  }

  public async retrieveDataRequestDetails(id: string, req: Request): Promise<DataTaskStatusPayloadDto> {
    const task = await this.tasksService.repo.findOne({
      where: {
        id: id
      }
    });

    const dto: DataTaskStatusPayloadDto = TasksService.toDto(task);

    const baseUrl = getResourceBaseUrl(req, true);

    dto.downloadUrl = `${baseUrl}/${dto.id}/download`;
    if (dto.status === DataTaskStatus.COMPLETE) {
    } else {
      dto.downloadUrl = null;
    }

    return dto;
  }

  public async fetchDatasetDiskPath(id: string): Promise<string | undefined> {
    const location = `${this.datasetsLocation}/${id}.json`;

    try {
      const test = await promises.access(location, constants.R_OK);

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
