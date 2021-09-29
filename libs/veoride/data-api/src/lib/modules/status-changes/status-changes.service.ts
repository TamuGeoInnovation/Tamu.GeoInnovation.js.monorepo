import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DataTask } from '@tamu-gisc/veoride/common/entities';

@Injectable()
export class StatusChangesService {
  constructor(@InjectRepository(DataTask) private readonly repo: Repository<DataTask>) {}
}
