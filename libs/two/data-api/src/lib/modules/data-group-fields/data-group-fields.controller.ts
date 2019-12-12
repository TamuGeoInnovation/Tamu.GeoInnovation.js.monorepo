import { Controller, Param, Get } from '@nestjs/common';

import { DataGroupFlds } from '@tamu-gisc/two/common';

import { BaseController } from '../base/base.controller';
import { DataGroupFieldsService } from './data-group-fields.service';

@Controller('dgf')
export class DataGroupFieldsController extends BaseController<DataGroupFlds> {
  constructor(private readonly service: DataGroupFieldsService) {
    super(service);
  }

  @Get()
  public getAll() {
    return this.service.getMany({
      select: ['dataGroupFlds_ID', 'dataGroupID'],
      relations: ['field']
    });
  }

  @Get(':id')
  public getMatching(@Param() params): Promise<DataGroupFlds[]> {
    return this.service.getMany({
      select: ['dataGroupFlds_ID'],
      relations: ['field'],
      where: { dataGroupID: params.id },
      order: {
        fieldID: 'ASC'
      }
    });
  }
}
