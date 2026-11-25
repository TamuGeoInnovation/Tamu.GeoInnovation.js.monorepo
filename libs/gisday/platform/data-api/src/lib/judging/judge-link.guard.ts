import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { SpeakerEditLink } from '../entities/all.entity';
import { SpeakerEditService } from '../speaker-edit/speaker-edit.service';

/** A request through a judge's link, once `JudgeLinkGuard` has found the link. */
export interface JudgeLinkRequest {
  judgingLink: SpeakerEditLink;
}

/**
 * Lets a request through only with a working judging link in its `:token` (#3183), by the speaker links' one check
 * (`SpeakerEditService.linkFor`) for a `judging` link, and puts the link on the request for the route. A speaker's profile
 * link is refused here as one that does not work, as a judging link is on the profile's routes.
 */
@Injectable()
export class JudgeLinkGuard implements CanActivate {
  constructor(private readonly edits: SpeakerEditService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    request.judgingLink = await this.edits.linkFor(request.params?.token, 'judging');

    return true;
  }
}
