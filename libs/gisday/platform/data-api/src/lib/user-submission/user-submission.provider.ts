import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SubmissionType, Submission, PRESENTATION_SUBMISSION_TYPE } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';
import { SeasonService } from '../season/season.service';

@Injectable()
export class UserSubmissionProvider extends BaseProvider<Submission> {
  constructor(
    @InjectRepository(Submission) public userSubmissionRepo: Repository<Submission>,
    @InjectRepository(SubmissionType) public submissionTypeRepo: Repository<SubmissionType>,
    private readonly seasonService: SeasonService
  ) {
    super(userSubmissionRepo);
  }

  /**
   * Retrieves all presentations for the active season for a given user.
   */
  public async getUserPresentationsForActiveSeason(
    userGuid: string,
    type: PRESENTATION_SUBMISSION_TYPE = PRESENTATION_SUBMISSION_TYPE.PRESENTATION
  ) {
    const season = await this.seasonService.findOneActive();

    if (!season) {
      return [];
    }

    try {
      return this.userSubmissionRepo.find({
        where: {
          accountGuid: userGuid,
          season: season,
          submissionType: type
        }
      });
    } catch (err) {
      throw new InternalServerErrorException('Could not retrieve user submissions.');
    }
  }

  /**
   * Retrieves a single presentation for a given user.
   */
  public async getUserPresentation(presentationGuid: string, userGuid: string, requestorPermissions: Array<string> = []) {
    const presentation = await this.userSubmissionRepo.findOne({
      where: {
        guid: presentationGuid
      }
    });

    if (!presentation) {
      throw new NotFoundException('Presentation not found');
    }

    if (presentation.accountGuid !== userGuid && requestorPermissions.indexOf('read:competitions') === -1) {
      throw new UnauthorizedException();
    }

    return presentation;
  }

  public async insertUserSubmission(accountGuid: string, submission: Partial<Submission>) {
    if (!submission || !accountGuid) {
      throw new InternalServerErrorException('Missing required parameters.');
    }

    const userSubmission = this.userSubmissionRepo.create({ ...submission, accountGuid });

    try {
      return this.userSubmissionRepo.save(userSubmission);
    } catch (err) {
      throw new InternalServerErrorException('Could not insert user submission.');
    }
  }

  public async deleteUserSubmission(submissionGuid: string, accountGuid: string, requestorPermissions: Array<string> = []) {
    const submission = await this.userSubmissionRepo.findOne({
      where: {
        guid: submissionGuid
      }
    });

    if (!submission) {
      throw new NotFoundException('Submission not found.');
    }

    if (submission.accountGuid !== accountGuid && requestorPermissions.indexOf('delete:competitions') > -1) {
      throw new UnauthorizedException();
    }

    try {
      return this.userSubmissionRepo.delete(submissionGuid);
    } catch (err) {
      throw new InternalServerErrorException('Could not delete user submission.');
    }
  }
}
