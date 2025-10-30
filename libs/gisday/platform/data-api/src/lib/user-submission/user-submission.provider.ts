import { Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SubmissionType, Submission } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';
import { SeasonService } from '../season/season.service';
import { ContactService } from '../contact/contact.service';

@Injectable()
export class UserSubmissionProvider extends BaseProvider<Submission> {
  constructor(
    @InjectRepository(Submission) public userSubmissionRepo: Repository<Submission>,
    @InjectRepository(SubmissionType) public submissionTypeRepo: Repository<SubmissionType>,
    private readonly seasonService: SeasonService,
    private readonly contactService: ContactService
  ) {
    super(userSubmissionRepo);
  }

  /**
   * Retrieves all presentations for the active season.
   */
  public async getSubmissionsForSeason(seasonGuid: string) {
    const existingSeason = await this.seasonService.findOne({
      where: {
        guid: seasonGuid
      }
    });

    if (!existingSeason) {
      return [];
    }

    try {
      return this.userSubmissionRepo.find({
        where: {
          season: existingSeason
        }
      });
    } catch (err) {
      throw new InternalServerErrorException('Could not retrieve user submissions.');
    }
  }

  public async getSubmissionsForActiveSeason() {
    const season = await this.seasonService.findOneActive();

    return this.getSubmissionsForSeason(season.guid);
  }

  /**
   * Retrieves all submissions for the active season for a given user.
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
          season: { guid: season.guid }
        }
      });
    } catch (err) {
      throw new InternalServerErrorException('Could not retrieve user submissions.');
    }
  }

  /**
   * Retrieves a single presentation for a given user.
   */
  public async getUserPresentation(submissionGuid: string, userGuid: string, requestorPermissions: Array<string> = []) {
    const presentation = await this.userSubmissionRepo.findOne({
      where: {
        guid: submissionGuid
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

  public async updateUserSubmission(
    submissionGuid: string,
    userGuid: string,
    submission: Partial<Submission>,
    requestorPermissions: Array<string> = []
  ) {
    const existingSubmission = await this.userSubmissionRepo.findOne({
      where: {
        guid: submissionGuid
      }
    });

    if (!existingSubmission) {
      throw new NotFoundException('Submission not found.');
    }

    if (existingSubmission.accountGuid !== userGuid && requestorPermissions.indexOf('update:competitions') === -1) {
      throw new UnauthorizedException();
    }

    let shouldEmail = false;
    // Only attempt to modify review fields if the user has permission
    // Otherwise, remove them preemptively to avoid users setting these.
    if (requestorPermissions.indexOf('update:competitions') > -1) {
      if (submission.acceptance !== undefined) {
        existingSubmission.reviewed = true;
        existingSubmission.acceptance = submission.acceptance;
        existingSubmission.message = submission.message;
        shouldEmail = true;
      } else {
        delete existingSubmission.acceptance;
        delete existingSubmission.message;
        delete existingSubmission.reviewed;
      }

      // At this point we have resolved the existing submission, so we can remove the guid.
      delete submission.guid;
    }

    try {
      return this.userSubmissionRepo.update(submissionGuid, submission).then((updated) => {
        if (shouldEmail) {
          const participantEmails = existingSubmission.participants.map((p) => p.email);
          const primaryParticipant = participantEmails.splice(0, 1);
          // Send email to user
          this.contactService
            .sendMessage(
              {
                to: primaryParticipant[0],
                cc: participantEmails.join(','),
                subject: 'GIS Day Presentation Submission Review Result',
                from: process.env.MAILROOM_FROM,
                text: this._generateResponseEmail(existingSubmission),
                replyTo: process.env.MAILROOM_TO
              },
              true
            )
            .catch((err) => {
              Logger.error(`Error sending email to user: ${err.message}`, 'UserSubmissionProvider');
            });
        }

        return updated;
      });
    } catch (err) {
      throw new InternalServerErrorException('Could not update user submission.');
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

    if (submission.accountGuid !== accountGuid && requestorPermissions.indexOf('delete:competitions') === -1) {
      throw new UnauthorizedException();
    }

    try {
      return this.userSubmissionRepo.delete(submissionGuid);
    } catch (err) {
      throw new InternalServerErrorException('Could not delete user submission.');
    }
  }

  private _generateResponseEmail(existingSubmission: Submission) {
    const { title, message, acceptance } = existingSubmission;

    return `
Howdy!

Thank you for your recent research presentation submission, titled "${title}."

${
  acceptance
    ? `We are pleased to inform you that your submission has been **approved** for inclusion in the TxGIS Day event. Please make sure you have reviewed the event schedule (https://txgisday.org/competitions/presentation) and are prepared to present at your designated time. If you have not done so yet, please ensure that you provide a link to your presentation materials in the submission portal. We look forward to seeing you at the event!`
    : `We regret to inform you that your submission has not been accepted for the TxGIS Day competition event. We appreciate the time and effort you put into your work, and encourage you to consider future opportunities to engage with the GIS community.`
}

${message ? `Additional notes: ${message}` : ''}

If you have any questions or concerns, please feel free to reach out to the TxGIS Day team at your convenience. We are here to assist you.

Best regards,
The TxGIS Day Team
      `;
  }
}
