import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { StatusAPIService } from './status-api.service';

@Controller('status')
export class StatusAPIController {
    constructor(private readonly statusService: StatusAPIService) {}

    @Get()
    public async getStatus() {
        return this.statusService.getStatus();
    }   

    @Post()
    public async getSiteHistory(@Body() body) {
        return this.statusService.getHistoryForSite(body);
    }
}
