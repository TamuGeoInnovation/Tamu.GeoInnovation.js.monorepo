import { BadRequestException } from '@nestjs/common';

import { isEmail } from 'class-validator';
import addressparser from 'nodemailer/lib/addressparser';

import { IMailroomEmailOutbound } from '../types/mail.types';

/**
 * The only message fields a caller may set. Nodemailer acts on many more: an attachment with a
 * `path` or `href` reads a file or URL on the server, a body given as an object does the same, and
 * `raw`, `envelope`, `headers` and `list` replace the message or its routing. Anything not listed
 * here is dropped (#2121).
 */
export const MAIL_ADDRESS_FIELDS = ['from', 'to', 'cc', 'bcc', 'replyTo'] as const;
export const MAIL_CONTENT_FIELDS = ['subject', 'text', 'html'] as const;

/**
 * Transport options that stop nodemailer reading files or URLs into a message, whatever the
 * message asks for. Spread into every `createTransport`.
 */
export const SAFE_TRANSPORT_OPTIONS = { disableFileAccess: true, disableUrlAccess: true } as const;

export interface SafeMailOptions extends Partial<Pick<IMailroomEmailOutbound, (typeof MAIL_ADDRESS_FIELDS)[number]>> {
  subject?: string;
  text?: string;
  html?: string;
  attachments?: Array<{ filename: string; content: Buffer; contentType: string }>;
}

/**
 * Builds a nodemailer message from the allowlisted fields of `email` only. Addresses must be
 * strings of email addresses (display names allowed, as in `"GIS Day" <gisday@tamu.edu>`); an empty
 * one is left out. Text fields are kept only when they are strings. Attachments come only from
 * uploaded `files`, as their content, never from the caller's object.
 */
export function toMailOptions(
  email: Partial<IMailroomEmailOutbound>,
  files: Array<Express.Multer.File> = []
): SafeMailOptions {
  const options: SafeMailOptions = {};

  for (const field of MAIL_ADDRESS_FIELDS) {
    const value: unknown = email?.[field];

    if (value === undefined || value === null || value === '') {
      continue;
    }

    const addresses = typeof value === 'string' ? addressparser(value) : [];

    if (addresses.length === 0 || !addresses.every((a) => typeof a.address === 'string' && isEmail(a.address))) {
      throw new BadRequestException(`Invalid ${field} address.`);
    }

    options[field] = value as string;
  }

  for (const field of MAIL_CONTENT_FIELDS) {
    if (typeof email?.[field] === 'string') {
      options[field] = email[field];
    }
  }

  if (files.length > 0) {
    options.attachments = files.map((file) => ({
      filename: file.originalname,
      content: file.buffer,
      contentType: file.mimetype
    }));
  }

  return options;
}
