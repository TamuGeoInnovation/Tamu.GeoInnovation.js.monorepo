import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards
} from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { siteHost } from '../_base/site-of-request';
import { EmailSenderService } from '../contact/email-sender.service';
import { emailOf } from '../speaker-edit/session-details-email.controller';
import { refuseTogether } from '../speaker-edit/speaker-edit.controller';
import { JudgeLinkGuard, type JudgeLinkRequest } from './judge-link.guard';
import { JudgingEmail, JudgingEmailService } from './judging-email.service';
import { type AssessmentBody, JudgingService } from './judging.service';
import { type RubricBody, RubricService } from './rubric.service';

/**
 * The rubrics judges score against (#3183), per season: read by whoever may see the competitions, changed by whoever may
 * review them.
 */
@Controller('rubrics')
export class RubricController {
  constructor(private readonly rubrics: RubricService) {}

  @Permissions(['read:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('season/:season')
  public forSeason(@Param('season') season: string) {
    return this.rubrics.forSeason(season);
  }

  @Permissions(['update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  public create(@Body() body: RubricBody) {
    return this.rubrics.create(body);
  }

  /** Its name, description and criteria; the criteria sent replace those it had, each sent with its id keeping it. */
  @Permissions(['update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Put(':guid')
  public update(@Param('guid') guid: string, @Body() body: RubricBody) {
    return this.rubrics.update(guid, body);
  }

  @Permissions(['update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  @HttpCode(204)
  public remove(@Param('guid') guid: string) {
    return this.rubrics.remove(guid);
  }
}

/**
 * Judging the research competitions (#3183). The link routes take no sign-in: the judge's own judging link in the path is
 * the proof, checked by the speaker links' one check for a `judging` link before anything runs. The results are the
 * admins' (decided 5A).
 */
@Controller('judging')
export class JudgingController {
  constructor(private readonly judging: JudgingService) {}

  /** What the judge judges: each competition with its rubric, its accepted submissions and the judge's own scores. */
  @UseGuards(JudgeLinkGuard)
  @Get('link/:token')
  public forJudge(@Request() req: JudgeLinkRequest) {
    return this.judging.forJudge(req.judgingLink);
  }

  /** Saves the judge's scores for one submission, until judging closes. */
  @UseGuards(JudgeLinkGuard)
  @Put('link/:token/:submission')
  public assess(
    @Param('submission', ParseUUIDPipe) submission: string,
    @Body() body: AssessmentBody,
    @Request() req: JudgeLinkRequest
  ) {
    return this.judging.assess(req.judgingLink, submission, body);
  }

  /** A competition's results in a season: every judge's totals, the averages, and each judge's progress. */
  @Permissions(['read:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('results')
  public results(@Query('season') season: string, @Query('competition') competition: string) {
    return this.judging.results(season, competition);
  }
}

/**
 * A session's judges asked to judge (#3183), from the session's admin page, beside its other speaker emails' routes and
 * behind the same permission.
 */
@Controller('session-emails')
export class JudgingEmailController {
  constructor(
    private readonly service: JudgingEmailService,
    private readonly senders: EmailSenderService
  ) {}

  /**
   * Asks the session's judges to judge, a copy each with their own judging link, in the subject and text the admin
   * approved, if given, as the sender they chose, checked first (#3100): the judges ticked (#3104). Asked to go to them
   * together, it is refused before anything is sent.
   */
  @Permissions(['update:speakers'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('judging')
  public async send(
    @Body()
    body:
      | ({ event?: string; sender?: string; speakers?: Array<string>; together?: unknown } & Partial<JudgingEmail>)
      | undefined,
    @Request() req
  ) {
    refuseTogether(
      body,
      "The Ask to judge email carries each judge's own link to score the entries, so it is sent as a copy each, never together."
    );

    const host = siteHost(req?.headers);
    const sender = await this.senders.resolve(req?.user, body?.sender, host);

    return this.service.send(body?.event, host, emailOf(body), sender, body?.speakers);
  }

  /** The email `judging` would send, prefilled from the session, for the admin to read and edit first. Nothing is sent. */
  @Permissions(['update:speakers'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('judging/preview')
  public preview(@Body('event') event: string, @Request() req) {
    return this.service.preview(event, siteHost(req?.headers));
  }
}
