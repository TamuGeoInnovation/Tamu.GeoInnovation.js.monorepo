import { Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ClientMetadataService } from '../../services/client-metadata/client-metadata.service';
// import { ClientMetadata, ClientMetadataRepo, GrantType, GrantTypeRepo } from '../../entities/all.entity';
// import { ClientMetadataService } from '../../services/client-metadata/client-metadata.service';
// import { getConnection } from 'typeorm';

@Controller('client-metadata')
export class ClientMetadataController {
  constructor(private readonly clientMetadataService: ClientMetadataService) { }

  @Get(':clientName')
  async allGet(@Param() params) {
    return this.clientMetadataService.getClient(params.clientName);
  }

  @Post()
  async insertOnePost(@Req() req: Request, @Res() res: Response) {
    // const insertSuccess = await ClientMetadataService.insertClient(req);
    // res.send({
    //     insertSuccess
    // })
  }

  @Post('grant')
  async insertGrantTypePost(@Req() req: Request, @Res() res: Response) {
    // const insertSuccess = await ClientMetadataService.insertGrantType(req);
    // res.send({
    //     insertSuccess
    // });
  }
}
