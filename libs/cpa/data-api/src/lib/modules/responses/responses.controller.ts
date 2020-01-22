import { Controller } from '@nestjs/common';

import { Responses } from '@tamu-gisc/cpa/common/entities';

import { BaseController } from '../base/base.controller';
import { ResponsesService } from './responses.service';

@Controller('responses')
export class ResponsesController extends BaseController<Responses> {
  constructor(private service: ResponsesService) {
    super(service);
  }
}
