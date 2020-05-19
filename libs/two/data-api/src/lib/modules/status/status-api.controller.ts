import { Controller, Get } from '@nestjs/common';
import { StatusAPIService } from './status-api.service';

@Controller('status')
export class StatusAPIController {
    constructor(private readonly statusService: StatusAPIService) {}

    @Get()
    public async getStatus() {
        return this.statusService.getStatus();
    }   
}
