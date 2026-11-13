import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Organization, Speaker, Sponsor } from '../entities/all.entity';

/**
 * The fields of a record that only the people who manage it may read, and the permission that lets them. Everyone
 * else, signed in or not, gets the record without them: a sponsor's or organization's contact person, what a sponsor
 * paid, and a speaker's email and account. The public pages show none of them; only the admin pages do.
 *
 * These are found by type (`instanceof`), so a route must answer with the entities themselves. A plain copy of a
 * speaker (a spread, a raw query, JSON.parse) would keep its email and account. `email` and `accountGuid` are not
 * removed by name as the contact fields are, because check-ins and class attendance use those names too and their
 * admin pages need them. A route that copies speakers must turn them back into entities (`manager.create`) first.
 */
export const PRIVATE_FIELDS: Array<{ type: new () => object; fields: Array<string>; permission: string }> = [
  {
    type: Sponsor,
    fields: ['contactFirstName', 'contactLastName', 'contactEmail', 'sponsorshipAmount'],
    permission: 'update:sponsors'
  },
  {
    type: Organization,
    fields: ['contactFirstName', 'contactLastName', 'contactEmail'],
    permission: 'update:organizations'
  },
  // Whether a speaker's badge is printed is for the admins who print them (#2908).
  { type: Speaker, fields: ['email', 'accountGuid', 'badgePrintedAt', 'badgePrintedText'], permission: 'update:speakers' }
];

/**
 * Contact fields under these names are removed from any object, not only from an entity, so a record a provider
 * copies into a plain object is covered too. They are kept for a user who may update sponsors or organizations.
 */
const CONTACT_FIELDS = ['contactFirstName', 'contactLastName', 'contactEmail'];
const CONTACT_PERMISSIONS = ['update:sponsors', 'update:organizations'];

/** Any permission that keeps some private field. */
const UNLOCKING_PERMISSIONS = PRIVATE_FIELDS.map((rule) => rule.permission);

/**
 * Removes the private fields from every response of the GIS Day API, at any depth, so a speaker's email does not
 * leave in a session's list of speakers either. Registered once for the whole API, so a route added later is covered
 * without anyone remembering to.
 *
 * Whether the caller may see them comes from `req.user`, which is set only on a route behind `JwtGuard`. The read
 * routes the admin pages use are behind `JwtGuard` with `AllowAny`, so a signed-out request still gets an answer; a
 * route with no guard has no user, so it always gets the record without its private fields.
 */
@Injectable()
export class PrivateFieldsInterceptor implements NestInterceptor {
  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const permissions: Array<string> = http.getRequest()?.user?.permissions ?? [];
    const response = http.getResponse();

    // The same address answers differently with and without a token, so no cache may hand one caller's answer to
    // another; and an answer that kept private fields must not be stored at all.
    // `vary` adds to whatever Vary is already set (CORS sets Origin) rather than replacing it.
    response?.vary?.('Authorization');
    if (UNLOCKING_PERMISSIONS.some((p) => permissions.includes(p))) {
      response?.setHeader?.('Cache-Control', 'private, no-store');
    }

    return next.handle().pipe(map((body) => withoutPrivateFields(body, permissions)));
  }
}

/**
 * `value` without the private fields `permissions` does not unlock. Objects are changed in place: they are this
 * response's own, read from the database for it. That is safe only while nothing caches entities or responses: a
 * cached object stripped for one public request would then reach admins without the fields. Whoever adds caching
 * must clone what this receives first.
 */
export function withoutPrivateFields<T>(value: T, permissions: Array<string> = []): T {
  const seen = new WeakSet<object>();
  const keepContacts = CONTACT_PERMISSIONS.some((p) => permissions.includes(p));

  const visit = (node: unknown) => {
    if (node === null || typeof node !== 'object' || seen.has(node) || Buffer.isBuffer(node) || node instanceof Date) {
      return;
    }

    seen.add(node);

    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }

    const record = node as Record<string, unknown>;

    for (const rule of PRIVATE_FIELDS) {
      if (record instanceof rule.type && !permissions.includes(rule.permission)) {
        rule.fields.forEach((field) => delete record[field]);
      }
    }

    if (!keepContacts) {
      CONTACT_FIELDS.forEach((field) => delete record[field]);
    }

    Object.values(record).forEach(visit);
  };

  visit(value);

  return value;
}
