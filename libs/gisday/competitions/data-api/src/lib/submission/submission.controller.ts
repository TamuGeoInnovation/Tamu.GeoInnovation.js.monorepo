import {
  BadRequestException,
  Body,
  ConflictException,
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
import { validate as isUuid } from 'uuid';

import { isOwnerOrPermitted, JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { CompetitionSubmission, SubmissionMedia } from '../entities/all.entities';

import { FormService } from '../form/form.service';
import { isDuplicateKey, SubmissionService } from './submission.service';
import { GetSubmissionDto, ValidateSubmissionDto } from '../dtos/dtos';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Multer } from 'multer';

/**
 * The permission that lets organizers read every participant's submissions. Everyone else reads only
 * their own (#1780).
 */
export const READ_ALL_SUBMISSIONS = 'read:competitions';

/**
 * The largest photograph the API accepts, in bytes.
 */
export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;

@Controller('competitions/submissions')
export class SubmissionController {
  constructor(private service: SubmissionService, private formService: FormService) {}

  /**
   * The signed-in participant's own submissions, for My VGI Submissions (#1791). Who they are comes
   * from the sign-in, so nothing on the page has to know their account id. Declared before
   * `user/:userGuid`, which would otherwise take `me` for an account id.
   */
  @UseGuards(JwtGuard)
  @Get('user/me')
  public async getMySubmissions(@Req() req, @Query('seasonGuid') seasonGuid?: string) {
    return this.service.getUserSubmissions({ userGuid: req.user.sub, seasonGuid });
  }

  @UseGuards(JwtGuard)
  @Get('user/:userGuid')
  public async getUserSubmissions(@Req() req, @Param('userGuid') userGuid: string, @Query('seasonGuid') seasonGuid?: string) {
    assertCanRead(req, userGuid);

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
    // One read: the row that carries the photograph also says whose it is.
    const submission = await this.service.getOne({
      where: {
        guid: param.guid
      },
      relations: ['blobs']
    });

    if (!submission) {
      throw new NotFoundException('Submission not found.');
    }

    assertCanRead(req, submission.userGuid);

    if (!submission.blobs?.length) {
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
   *
   * The app names each submission with a `guid` of its own, the same on every attempt to send it, so an
   * upload sent again after its answer was lost returns the submission already saved instead of saving
   * a second one (#1786).
   */
  @UseGuards(JwtGuard)
  @Post('')
  // Up to two photographs of at most 15 MB each; the app shrinks them first (#1786). A larger one
  // answers 413.
  @UseInterceptors(AnyFilesInterceptor({ limits: { fileSize: MAX_PHOTO_BYTES, files: 2 } }))
  public async insert(@Req() req, @Body() body, @UploadedFiles() files?: Array<Express.Multer.File>) {
    const season = await this.formService.getSeason(body.season);

    if (!season) {
      throw new UnprocessableEntityException('Competition season not found.');
    }

    if (season.allowSubmissions === false || season.allowSubmissions === null) {
      throw new BadRequestException('Submissions are disabled for this season.');
    }

    if (body.guid !== undefined && !isUuid(body.guid)) {
      throw new BadRequestException('A submission id must be a UUID.');
    }

    const existing = await this._alreadySaved(req, body.guid);

    if (existing) {
      return existing;
    }

    const sub: DeepPartial<CompetitionSubmission> = {
      guid: body.guid,
      value: JSON.parse(body.value),
      userGuid: req.user.sub,
      location: JSON.parse(body.location),
      season: season
    };

    const entityFiles = (files ?? []).map((file) => {
      const _file: DeepPartial<SubmissionMedia> = {
        blob: file.buffer,
        mimeType: file.mimetype,
        fieldName: file.fieldname
      };

      return _file;
    });

    try {
      return await this.service.createCompetitionSubmission(sub, entityFiles);
    } catch (err) {
      // The same submission, sent again while the first was still being saved: return that one.
      const saved = isDuplicateKey(err) ? await this._alreadySaved(req, body.guid) : undefined;

      if (saved) {
        return saved;
      }

      throw err;
    }
  }

  /**
   * The submission already saved under the id the app sent, when the signed-in user saved it; 409 when
   * someone else did (#1786).
   */
  private async _alreadySaved(req, submissionGuid?: string) {
    const existing = submissionGuid !== undefined ? await this.service.getSubmissionByGuid(submissionGuid) : undefined;

    if (existing && !isOwnerOrPermitted(req.user, existing.userGuid)) {
      throw new ConflictException('A submission with this id already exists.');
    }

    return existing ?? undefined;
  }

  /**
   * The submission, when the signed-in user made it or may read every submission.
   */
  private async _assertCanRead(req, submissionGuid: string) {
    const submission = await this.service.getSubmissionByGuid(submissionGuid);

    if (!submission) {
      throw new NotFoundException('Submission not found.');
    }

    assertCanRead(req, submission.userGuid);

    return submission;
  }
}

/**
 * Lets the request through when it is from `ownerGuid` or from someone who may read every submission.
 */
function assertCanRead(req, ownerGuid: string) {
  if (!isOwnerOrPermitted(req?.user, ownerGuid, READ_ALL_SUBMISSIONS)) {
    throw new ForbiddenException('You can only see your own submissions.');
  }
}
