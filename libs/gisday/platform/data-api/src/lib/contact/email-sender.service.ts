import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { isEmail } from 'class-validator';

import { ManagementService } from '@tamu-gisc/common/nest/auth';
import { EmailSenderChoice, EmailSenderChoices, SENDER_DOMAIN, gisdaySite, isSenderDomain } from '@tamu-gisc/gisday/common';

import { senderAs } from '../_base/site-of-request';
import { Auth0ProfileAsRead } from '../dashboards/dashboard-profiles.service';

/** What a send gives the mailer (#3100): the From recipients see, and where their replies go. */
export interface EmailSender {
  from: string | undefined;
  replyTo: string | undefined;
}

/** The signed-in admin, as the API's token check leaves them on the request: the access token's claims. */
export type SignedInAdmin = { sub?: string } & Record<string, unknown>;

/**
 * The site's own sender, as every email was sent before #3100: the configured address under the site's name, with replies
 * to `MAILROOM_TO`. A send that names no sender is sent this way.
 */
export function siteSender(siteName: string): EmailSender {
  return { from: senderAs(siteName, process.env.MAILROOM_FROM), replyTo: process.env.MAILROOM_TO || undefined };
}

/** The bare address of a setting written as "Name <address>" or as the address alone. */
function addressOf(configured: string | undefined): string | undefined {
  return (configured?.match(/<([^>]+)>/)?.[1] ?? configured)?.trim() || undefined;
}

/** A display name made safe to put inside a From header's quotes. */
function displayName(name: string): string {
  return name.replace(/["\\<>\r\n]/g, '').trim();
}

const same = (a: string | undefined, b: string | undefined) =>
  !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

/** The setting the last warning was logged for, so an ignored entry is reported once, not on every request. */
let warnedFor: string | undefined;

/**
 * `MAILROOM_SENDERS`, comma-separated, split into the shared addresses that may be sent as and the entries ignored: an
 * entry that is not an address, or not a `SENDER_DOMAIN` one, is ignored with a warning in the log.
 */
export function configuredSenders(setting = process.env.MAILROOM_SENDERS): {
  allowed: Array<string>;
  ignored: Array<string>;
} {
  const allowed: Array<string> = [];
  const ignored: Array<string> = [];

  for (const entry of (setting ?? '').split(',')) {
    const address = addressOf(entry);

    if (!address) {
      continue;
    }

    if (isEmail(address) && isSenderDomain(address)) {
      allowed.push(address);
    } else {
      ignored.push(address);
    }
  }

  if (ignored.length && warnedFor !== setting) {
    warnedFor = setting;

    for (const address of ignored) {
      Logger.warn(
        `MAILROOM_SENDERS lists ${address}, which is not a ${SENDER_DOMAIN} address; it is ignored, and a send as it is refused.`,
        'EmailSenderService'
      );
    }
  }

  return { allowed, ignored };
}

/**
 * Which addresses an admin may send the composer's emails as (#3100), and the check every send route makes on the one
 * chosen. Allowed: the admin's own address, from their token (its `email` claim, or the email of the account the token
 * names), the site's `MAILROOM_FROM`, and the shared addresses in `MAILROOM_SENDERS`. Only `SENDER_DOMAIN` addresses,
 * apart from the site's own: a From in another domain fails the receiving server's DMARC check. Anything else is refused
 * with a reason before anything is sent.
 */
@Injectable()
export class EmailSenderService {
  constructor(private readonly management: ManagementService) {
    // Reported when the API starts, not only on the first send.
    configuredSenders();
  }

  /** The choices for the signed-in admin, their own address first, as the default. */
  public async choices(user: SignedInAdmin | undefined, host?: string): Promise<EmailSenderChoices> {
    const site = gisdaySite(process.env.GISDAY_SITE, host);
    const own = await this.ownIdentity(user);
    const choices: Array<EmailSenderChoice> = [];
    const unavailable: EmailSenderChoices['unavailable'] = [];
    const add = (choice: EmailSenderChoice) => {
      if (!choices.some((c) => same(c.address, choice.address))) {
        choices.push(choice);
      }
    };

    if (own.email && isSenderDomain(own.email)) {
      const name = displayName(own.name ?? '');

      add({
        kind: 'own',
        address: own.email,
        label: `Your address (${own.email})`,
        from: `"${name ? `${name} (${displayName(site.name)})` : displayName(site.name)}" <${own.email}>`,
        replyTo: own.email
      });
    } else if (own.email) {
      unavailable.push({
        address: own.email,
        reason: `Your address is not a ${SENDER_DOMAIN} address, so emails cannot be sent as it.`
      });
    }

    const siteAddress = addressOf(process.env.MAILROOM_FROM);
    const sender = siteSender(site.name);

    if (siteAddress && sender.from) {
      add({
        kind: 'site',
        address: siteAddress,
        label: `The site's address (${siteAddress})`,
        from: sender.from,
        replyTo: sender.replyTo ?? siteAddress
      });
    }

    for (const address of configuredSenders().allowed) {
      add({
        kind: 'shared',
        address,
        label: `Shared address (${address})`,
        from: `"${displayName(site.name)}" <${address}>`,
        replyTo: address
      });
    }

    return { choices, unavailable };
  }

  /**
   * The From and Reply-To for the sender an admin chose, or `undefined` when they chose none, and the email goes from the
   * site as before (`siteSender`). Anything they may not send as is refused with a 400 saying why, so the route sends
   * nothing.
   */
  public async resolve(
    user: SignedInAdmin | undefined,
    requested: unknown,
    host?: string
  ): Promise<EmailSender | undefined> {
    if (requested === undefined || requested === null || requested === '') {
      return undefined;
    }

    if (typeof requested !== 'string' || !isEmail(requested.trim())) {
      throw new BadRequestException('"Send as" must be an email address.');
    }

    const address = requested.trim();
    const { choices } = await this.choices(user, host);
    const chosen = choices.find((c) => same(c.address, address));

    if (chosen) {
      return { from: chosen.from, replyTo: chosen.replyTo };
    }

    if (configuredSenders().ignored.some((ignored) => same(ignored, address))) {
      throw new BadRequestException(
        `Cannot send as ${address}: it is listed in MAILROOM_SENDERS, but only ${SENDER_DOMAIN} addresses may be sent as.`
      );
    }

    if (!isSenderDomain(address)) {
      throw new BadRequestException(`Cannot send as ${address}: only ${SENDER_DOMAIN} addresses may be sent as.`);
    }

    throw new BadRequestException(
      `Cannot send as ${address}: it is not your own address, the site's address, or a shared address in MAILROOM_SENDERS.`
    );
  }

  /**
   * The admin's own address and name: the token's `email` and `name` claims (or namespaced ones ending in `/email` and
   * `/name`), and otherwise the account the token names, read from Auth0. Never from anything the request says.
   */
  private async ownIdentity(user: SignedInAdmin | undefined): Promise<{ email?: string; name?: string }> {
    let email = claim(user, 'email');
    let name = claim(user, 'name');

    if ((!email || !name) && typeof user?.sub === 'string') {
      try {
        const profile: Auth0ProfileAsRead = await this.management.getUserMetadata(user.sub, undefined, true);

        email = email ?? (profile.user_info?.email?.trim() || undefined);
        name = name ?? (profile.user_info?.name?.trim() || undefined);
      } catch {
        // No management credentials (locally, #1759) or no such account: the token's claims are all there is.
      }
    }

    return { email: email && isEmail(email) ? email : undefined, name };
  }
}

/** A string claim of the token by its name, or a namespaced one ending in `/<name>`. */
function claim(user: SignedInAdmin | undefined, name: string): string | undefined {
  const direct = user?.[name];
  const namespaced = Object.entries(user ?? {}).find(([key]) => key.endsWith(`/${name}`))?.[1];
  const value = typeof direct === 'string' ? direct : typeof namespaced === 'string' ? namespaced : undefined;

  return value?.trim() || undefined;
}
