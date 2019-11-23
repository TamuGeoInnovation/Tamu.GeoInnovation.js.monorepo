import { Controller, Get, Param } from '@nestjs/common';
import { DataService } from './data.service';

@Controller('data')
export class DataController {
  constructor(private service: DataService) {}

  @Get(':station/:columns')
  public getData(@Param() params) {
    debugger;
  }
}
