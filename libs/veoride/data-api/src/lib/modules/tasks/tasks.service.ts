import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DataTask } from '@tamu-gisc/veoride/common/entities';

@Injectable()
export class TasksService {
  constructor(@InjectRepository(DataTask) public readonly repo: Repository<DataTask>) {}

  public static taskToDto(task: DataTask): DataTaskPayloadDto {
    delete task.updated;
    delete task.created;
    delete task.requester;
    delete task.parameters;

    return task;
  }

  public async findOrCreate(options: CreateTaskDto): Promise<DataTask> {
    const existing = await this.repo.findOne({
      where: {
        parameters: options.resourceParams,
        resource: options.resourceName,
        requester: options.userGuid
      }
    });

    if (existing) {
      return existing;
    }

    const t = new DataTask();

    t.resource = options.resourceName;
    t.parameters = options.resourceParams;
    t.requester = options.userGuid;

    return t.save();
  }
}

interface CreateTaskDto {
  resourceName: string;
  resourceParams: string;
  userGuid: string;
}

export interface DataTaskPayloadDto extends Omit<DataTask, 'updated' | 'created' | 'requester' | 'parameters'> {
  url?: string;
}
