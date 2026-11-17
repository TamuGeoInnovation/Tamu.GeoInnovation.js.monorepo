import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { SpeakerEditLink } from '../entities/all.entity';
import { SpeakerEditService } from './speaker-edit.service';

/** A request through a speaker's edit link, once `SpeakerEditLinkGuard` has found the link. */
export interface SpeakerLinkRequest {
  speakerEditLink: SpeakerEditLink;
}

/**
 * Lets a request through only with a working speaker edit link in its `:token` (#3093), by the link's own check
 * (`SpeakerEditService.linkFor`), and puts the link on the request for the route. Only a `profile` link: a judge's link
 * (#3183) is refused here as one that does not work. A guard runs before any interceptor, so
 * a slide upload with a link that does not work is refused before a byte of the file is written.
 */
@Injectable()
export class SpeakerEditLinkGuard implements CanActivate {
  constructor(private readonly edits: SpeakerEditService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    request.speakerEditLink = await this.edits.linkFor(request.params?.token, 'profile');

    return true;
  }
}
