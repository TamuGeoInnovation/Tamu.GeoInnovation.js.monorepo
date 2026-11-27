import type { Browser, BrowserContext, Page, Request } from '@playwright/test';

import { ApiAnswer, ApiCalls, captureContext, signInAsAdmin, stubApi } from './admin-capture';

/**
 * Opening an admin form and reading what it sends, for the save round trips (#3839): the laptop's g49 walk checked by
 * hand that every admin form saves, reopens with every field kept, and saves an edit with every field the record had.
 * Built on the admin capture helper (#3806): signed in as an admin, the API answered from fixtures.
 */

/** What a form sent: a write to the API, with its body read as the API would. */
export interface Sent {
  method: string;
  /** The path after `/api`. */
  path: string;
  /** A JSON body as parsed, or a multipart body as its fields: each text as given, each file as `{ file, size }`. */
  body: Record<string, unknown>;
}

export interface AdminPage {
  context: BrowserContext;
  page: Page;
  calls: ApiCalls;
  /** Every POST, PUT, PATCH and DELETE the page sent, in order. */
  sent: Array<Sent>;
}

/**
 * The record a write answers with. Fixture APIs are answered with the request's own fields, so a page that reads the
 * saved record back sees what it sent.
 */
const SAVED: ApiAnswer = { method: 'POST', path: /.*/, json: {} };

/** Signs in as an admin with every permission the admin pages check, answers the API from `answers`, opens a page. */
export async function openAdmin(
  browser: Browser,
  baseURL: string,
  answers: ReadonlyArray<ApiAnswer>,
  permissions: Array<string> = ADMIN_PERMISSIONS
): Promise<AdminPage> {
  const context = await captureContext(browser, { width: 1280, height: 1000 });
  await signInAsAdmin(context, baseURL, { permissions });

  // Writes are answered `{}` unless a test answers them itself, so a save reports success and the form moves on.
  const writes: Array<ApiAnswer> = ['POST', 'PUT', 'PATCH', 'DELETE'].map((method) => ({ ...SAVED, method }));
  const calls = await stubApi(context, baseURL, [...answers, ...writes]);
  const sent: Array<Sent> = [];
  const origin = new URL(baseURL).origin;

  context.on('request', (request) => {
    const url = new URL(request.url());

    if (url.origin === origin && url.pathname.startsWith('/api/') && request.method() !== 'GET') {
      sent.push({ method: request.method(), path: url.pathname.replace(/^\/api/, ''), body: {} });
      const entry = sent[sent.length - 1];
      void bodyOf(request).then((body) => (entry.body = body));
    }
  });

  return { context, page: await context.newPage(), calls, sent };
}

/** The first write matching `method` and `path`, once the page has sent it and its body has been read. */
export async function sentTo(admin: AdminPage, method: string, path: RegExp, timeout = 10_000): Promise<Sent> {
  const until = Date.now() + timeout;

  while (Date.now() < until) {
    const found = admin.sent.find((s) => s.method === method && path.test(s.path));

    if (found && Object.keys(found.body).length > 0) {
      return found;
    }

    await admin.page.waitForTimeout(50);
  }

  const seen = admin.sent.map((s) => `${s.method} ${s.path}`).join(', ') || 'nothing';
  throw new Error(`No ${method} to ${path} was sent; the page sent ${seen}.`);
}

/** Every permission string the GIS Day site and API name (grep of libs/gisday, as of #3839), so no test is refused by one it did not think of. */
export const ADMIN_PERMISSIONS = ['create:assets', 'create:checkins', 'create:classes', 'create:competitions', 'create:event-broadcasts', 'create:event-locations', 'create:events', 'create:organizations', 'create:places', 'create:season-days', 'create:seasons', 'create:speakers', 'create:sponsors', 'create:tags', 'create:universities', 'create:users', 'delete:assets', 'delete:checkins', 'delete:classes', 'delete:competitions', 'delete:event-broadcasts', 'delete:event-locations', 'delete:events', 'delete:organizations', 'delete:places', 'delete:season-days', 'delete:seasons', 'delete:speakers', 'delete:sponsors', 'delete:tags', 'delete:universities', 'delete:users', 'read:checkins', 'read:classes', 'read:competitions', 'read:events', 'read:rsvps', 'read:users', 'update:assets', 'update:classes', 'update:competitions', 'update:event-broadcasts', 'update:event-locations', 'update:events', 'update:organizations', 'update:places', 'update:season-days', 'update:seasons', 'update:speakers', 'update:sponsors', 'update:tags', 'update:universities'];

async function bodyOf(request: Request): Promise<Record<string, unknown>> {
  const buffer = request.postDataBuffer();
  const type = request.headers()['content-type'] ?? '';

  if (!buffer) {
    return { '': '(no body)' };
  }

  if (type.startsWith('multipart/form-data')) {
    // Node reads a multipart body as the API would.
    const form = await new Response(buffer, { headers: { 'content-type': type } }).formData();
    const fields: Record<string, unknown> = {};

    form.forEach((value, key) => {
      const field = typeof value === 'string' ? value : { file: value.name, size: value.size };
      // A key sent more than once is kept as every value, in order.
      fields[key] = key in fields ? [...([] as Array<unknown>).concat(fields[key]), field] : field;
    });

    return fields;
  }

  try {
    return JSON.parse(buffer.toString('utf8'));
  } catch {
    return { '': buffer.toString('utf8') };
  }
}
