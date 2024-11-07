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
  public async getUserPresentationsForActiveSeason(userGuid: string) {
    const season = await this.seasonService.findOneActive();

    if (!season) {
      return [];
    }

    try {
      return this.userSubmissionRepo.find({
        where: {
          accountGuid: userGuid,
          season: season,
          submissionType: PRESENTATION_SUBMISSION_TYPE.PRESENTATION
        }
      });
    } catch (err) {
      throw new InternalServerErrorException('Could not retrieve user submissions.');
    }
  }

  /**
   * Retrieves a single presentation for a given user.
   */
  public async getUserPresentation(presentationGuid: string, userGuid: string, requestorRoles: Array<string> = []) {
    const presentation = await this.userSubmissionRepo.findOne({
      where: {
        guid: presentationGuid
      }
    });

    if (!presentation) {
      throw new NotFoundException('Presentation not found');
    }

    if (presentation && presentation.accountGuid === userGuid) {
      return presentation;
    }

    if (requestorRoles.indexOf('admin') === -1) {
      return presentation;
    }

    throw new UnauthorizedException();
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
}
