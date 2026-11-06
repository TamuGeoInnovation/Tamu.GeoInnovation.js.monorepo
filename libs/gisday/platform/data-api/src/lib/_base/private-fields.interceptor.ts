import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Organization, Speaker, Sponsor } from '../entities/all.entity';

/**
 * The fields of a record that only the people who manage it may read, and the permission that lets them. Everyone
 * else, signed in or not, gets the record without them: a sponsor's or organization's contact person, what a sponsor
 * paid, and a speaker's email and account. The public pages show none of them; only the admin pages do.
 */
const PRIVATE_FIELDS: Array<{ type: new () => object; fields: Array<string>; permission: string }> = [
  { type: Sponsor, fields: ['contactFirstName', 'contactLastName', 'contactEmail', 'sponsorshipAmount'], permission: 'update:sponsors' },
  { type: Organization, fields: ['contactFirstName', 'contactLastName', 'contactEmail'], permission: 'update:organizations' },
  { type: Speaker, fields: ['email', 'accountGuid'], permission: 'update:speakers' }
];

/**
 * Contact fields under these names are removed from any object, not only from an entity, so a record a provider
 * copies into a plain object is covered too. They are kept for a user who may update sponsors or organizations.
 */
const CONTACT_FIELDS = ['contactFirstName', 'contactLastName', 'contactEmail'];
const CONTACT_PERMISSIONS = ['update:sponsors', 'update:organizations'];

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

    const permissions: Array<string> = context.switchToHttp().getRequest()?.user?.permissions ?? [];

    return next.handle().pipe(map((body) => withoutPrivateFields(body, permissions)));
  }
}

/**
 * `value` without the private fields `permissions` does not unlock. Objects are changed in place: they are this
 * response's own, read from the database for it.
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
