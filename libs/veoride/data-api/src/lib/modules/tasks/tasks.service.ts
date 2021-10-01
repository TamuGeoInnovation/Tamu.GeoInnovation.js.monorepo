import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DataTask } from '@tamu-gisc/veoride/common/entities';

@Injectable()
export class TasksService {
  constructor(@InjectRepository(DataTask) public readonly repo: Repository<DataTask>) {}

  public static toDto(task: DataTask): DataTaskRequestPayloadDto {
    const copy = { ...task };

    delete copy.updated;
    delete copy.created;
    delete copy.requester;

    copy.parameters = JSON.parse(task.parameters);

    return (copy as unknown) as DataTaskRequestPayloadDto;
  }
}

export interface DataTaskRequestPayloadDto
  extends Partial<Omit<DataTask, 'updated' | 'created' | 'requester' | 'parameters'>> {
  statusUrl?: string;
  parameters: object;
}

export interface DataTaskStatusPayloadDto
  extends Partial<Omit<DataTask, 'updated' | 'created' | 'requester' | 'parameters'>> {
  downloadUrl?: string;
  parameters: object;
}
