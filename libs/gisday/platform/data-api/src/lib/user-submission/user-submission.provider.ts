import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { SubmissionType, Submission } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class UserSubmissionProvider extends BaseProvider<Submission> {
  constructor(
    @InjectRepository(Submission) public userSubmissionRepo: Repository<Submission>,
    @InjectRepository(SubmissionType) public submissionTypeRepo: Repository<SubmissionType>
  ) {
    super(userSubmissionRepo);
  }

  public async insertUserSubmission(accountGuid: string, submission: Partial<Submission>) {
    // const submissionType = await this.submissionTypeRepo.findOne({
    //   where: {
    //     guid: _userSubmission.submissionType
    //   }
    // });

    // if (submissionType) {
    submission.accountGuid = accountGuid;

    const userSubmission = this.userSubmissionRepo.create(submission);

    return this.userSubmissionRepo.save(userSubmission);
    // } else {
    // throw new UnprocessableEntityException(null, 'Could not find submission type');
    // }
  }
}
