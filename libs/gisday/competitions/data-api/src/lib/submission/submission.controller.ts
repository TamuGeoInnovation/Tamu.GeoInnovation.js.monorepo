import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnprocessableEntityException,
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

/**
 * The permission that lets organizers read every participant's submissions. Everyone else reads only
 * their own (#1780).
 */
export const READ_ALL_SUBMISSIONS = 'read:competitions';

@Controller('competitions/submissions')
export class SubmissionController {
  constructor(private service: SubmissionService, private formService: FormService) {}

  @UseGuards(JwtGuard)
  @Get('user/:userGuid')
  public async getUserSubmissions(@Req() req, @Param('userGuid') userGuid: string, @Query('seasonGuid') seasonGuid?: string) {
    assertOwnerOrReader(req, userGuid);

    return this.service.getUserSubmissions({ userGuid, seasonGuid });
  }

  @UseGuards(JwtGuard)
  @Get(':guid/images')
  public async getSubmissionImages(@Req() req, @Param() params: GetSubmissionDto) {
    await this._assertCanRead(req, params.guid);

    return this.service.getSubmissionImages(params.guid);
  }

  @UseGuards(JwtGuard)
  @Get(':guid/image')
  public async getSubmissionImage(@Req() req, @Param() param, @Res() res) {
    await this._assertCanRead(req, param.guid);

    const submission = await this.service.getOne({
      where: {
        guid: param.guid
      },
      relations: ['location', 'season', 'blobs']
    });

    if (!submission?.blobs?.length) {
      throw new NotFoundException('This submission has no image.');
    }

    function bufferToStream(myBuuffer) {
      const tmp = new Duplex();
      tmp.push(myBuuffer);
      tmp.push(null);
      return tmp;
    }

    const myReadableStream = bufferToStream(submission.blobs[0].blob);

    myReadableStream.pipe(res);
  }

  @Permissions([READ_ALL_SUBMISSIONS])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('admin')
  public async getAdminSubmissions(@Query('seasonGuid') seasonGuid?: string) {
    return this.service.getAdminSubmissions({ seasonGuid });
  }

  @UseGuards(JwtGuard)
  @Get(':guid')
  public async getSubmission(@Req() req, @Param() params: GetSubmissionDto) {
    return this._assertCanRead(req, params.guid);
  }

  @Permissions([READ_ALL_SUBMISSIONS])
  @UseGuards(JwtGuard, PermissionsGuard)
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

  /**
   * Records a submission for the signed-in participant. Who submitted it comes from the sign-in, never
   * from the request, so nobody can submit as someone else (#1780).
   */
  @UseGuards(JwtGuard)
  @Post('')
  @UseInterceptors(AnyFilesInterceptor())
  public async insert(@Req() req, @Body() body, @UploadedFiles() files?: Array<Express.Multer.File>) {
    const season = await this.formService.getSeason(body.season);

    if (!season) {
      throw new UnprocessableEntityException('Competition season not found.');
    }

    if (season.allowSubmissions === false || season.allowSubmissions === null) {
      throw new BadRequestException('Submissions are disabled for this season.');
    }

    const sub: DeepPartial<CompetitionSubmission> = {
      value: JSON.parse(body.value),
      userGuid: req.user.sub,
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

  /**
   * The submission, when the signed-in user made it or may read every submission.
   */
  private async _assertCanRead(req, submissionGuid: string) {
    const submission = await this.service.getSubmissionByGuid(submissionGuid);

    if (!submission) {
      throw new NotFoundException('Submission not found.');
    }

    assertOwnerOrReader(req, submission.userGuid);

    return submission;
  }
}

/**
 * Lets the request through when it is from `ownerGuid` or from someone who may read every submission.
 */
function assertOwnerOrReader(req, ownerGuid: string) {
  const user = req?.user;
  const canReadAll = Array.isArray(user?.permissions) && user.permissions.includes(READ_ALL_SUBMISSIONS);

  if (!user?.sub || (user.sub !== ownerGuid && !canReadAll)) {
    throw new ForbiddenException('You can only see your own submissions.');
  }
}
