import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { DeepPartial } from 'typeorm';
import { Duplex } from 'stream';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { CompetitionSubmission, SubmissionMedia } from '../entities/all.entities';

import { FormService } from '../form/form.service';
import { SubmissionService } from './submission.service';
import { GetSubmissionDto, ValidateSubmissionDto } from '../dtos/dtos';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Multer } from 'multer';

@Controller('competitions/submissions')
export class SubmissionController {
  constructor(private service: SubmissionService, private formService: FormService) {}
  @Get('user/:userGuid')
  public async getUserSubmissions(@Param('userGuid') userGuid: string, @Query('seasonGuid') seasonGuid?: string) {
    return this.service.getUserSubmissions({ userGuid, seasonGuid });
  }

  
  @Get(':guid/images')
  public async getSubmissionImages(@Param() params: GetSubmissionDto) {
    return this.service.getSubmissionImages(params.guid);
  }
  
  @Get(':guid/image')
  public async getSubmissionImage(@Param() param, @Res() res) {
    const submission = await this.service.getOne({
      where: {
        guid: param.guid
      },
      relations: ['location', 'season', 'blobs']
    });
    
    function bufferToStream(myBuuffer) {
      const tmp = new Duplex();
      tmp.push(myBuuffer);
      tmp.push(null);
      return tmp;
    }
    
    const myReadableStream = bufferToStream(submission.blobs[0].blob);
    
    myReadableStream.pipe(res);
  }
  
  @Get('admin')
  public async getAdminSubmissions(@Query('seasonGuid') seasonGuid?: string) {
    return this.service.getAdminSubmissions({ seasonGuid });
  }

  @Get(':guid')
  public async getSubmission(@Param() params: GetSubmissionDto) {
    return this.service.getSubmissionByGuid(params.guid);
  }

  @Get()
  public getAll() {
    return this.service.getMany({
      relations: ['location', 'season', 'season.form']
    });
  }

  @Permissions(['update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('validate')
  public async validateSubmission(@Body() body: ValidateSubmissionDto, @Req() req) {
    return this.service.validateSubmission({ ...body, userGuid: req.user.sub });
  }

  @Post('')
  @UseInterceptors(AnyFilesInterceptor())
  public async insert(@Body() body, @UploadedFiles() files?: Array<Express.Multer.File>) {
    const season = await this.formService.getSeason(body.season);

    if (season.allowSubmissions === false || season.allowSubmissions === null) {
      throw new BadRequestException('Submissions are disabled for this season.');
    }

    const sub: DeepPartial<CompetitionSubmission> = {
      value: JSON.parse(body.value),
      userGuid: body.userGuid,
      location: JSON.parse(body.location),
      season: season
    };

    if (files) {
      const entityFiles = files.map((file) => {
        const _file: DeepPartial<SubmissionMedia> = {
          blob: file.buffer,
          mimeType: file.mimetype,
          fieldName: file.fieldname
        };

        return _file;
      });

      return this.service.createCompetitionSubmission(sub, entityFiles);
    } else {
      return this.service.createOne(sub);
    }
  }
}
