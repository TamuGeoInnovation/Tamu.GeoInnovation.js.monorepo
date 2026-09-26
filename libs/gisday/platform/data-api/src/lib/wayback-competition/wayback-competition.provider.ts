import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  SignageSubmission,
  StormwaterSubmission,
  SidewalkSubmission,
  ManholeSubmission
} from '../entities/all.entity';

/**
 * Read-only access to the archived competition submissions.
 *
 * This provider could not compile as written: it imported from `../../entities/all.entity`, a path
 * that does not exist, and named four symbols -- `SignageSubmissionRepo` and friends -- that appear
 * nowhere in the repository. It went unnoticed because `WaybackCompetitionModule` is not imported
 * by the application module, so nothing ever pulled the file into a build.
 *
 * The entities and the repository registration the module already declares are what it needed.
 */
@Injectable()
export class WaybackCompetitionProvider {
  constructor(
    @InjectRepository(SignageSubmission) private readonly signageRepo: Repository<SignageSubmission>,
    @InjectRepository(StormwaterSubmission) private readonly stormwaterRepo: Repository<StormwaterSubmission>,
    @InjectRepository(SidewalkSubmission) private readonly sidewalkRepo: Repository<SidewalkSubmission>,
    @InjectRepository(ManholeSubmission) private readonly manholeRepo: Repository<ManholeSubmission>
  ) {}

  public async getSignageSubmissions() {
    return this.signageRepo.find();
  }

  public async getStormwaterSubmissions() {
    return this.stormwaterRepo.find();
  }

  public async getSidewalkSubmissions() {
    return this.sidewalkRepo.find();
  }

  public async getManholeSubmissions() {
    return this.manholeRepo.find();
  }
}
