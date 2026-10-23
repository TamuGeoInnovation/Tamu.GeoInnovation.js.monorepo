import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import { IMailroomEmailOutbound, SAFE_TRANSPORT_OPTIONS, toMailOptions } from '@tamu-gisc/mailroom/common';

export type NodeMailerServices = 'ethereal' | 'gmail' | 'tamu-relay';

/**
 * Mailroom's mail transport. Moved here, server-side, from `libs/oidc/common` when the self-hosted IdP was retired (#2158, #2155);
 * the IdP's own account emails (two-step codes, password resets, account confirmation) went with it.
 */
export class Mailer {
  private static transporter: Mail;
  private static service: NodeMailerServices;

  // https://dev.to/chandrapantachhetri/sending-emails-securely-using-node-js-nodemailer-smtp-gmail-and-oauth2-g3a
  // 2LO https://nodemailer.com/smtp/oauth2/#oauth-2lo
  public static build(service: NodeMailerServices, dev: boolean) {
    Mailer.service = service;

    switch (service) {
      case 'ethereal':
        // use ethereal email and print out links to console (debugging / dev)
        Mailer.transporter = nodemailer.createTransport({
          ...SAFE_TRANSPORT_OPTIONS,
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: '',
            pass: ''
          }
        });
        break;
      case 'tamu-relay':
        Mailer.transporter = nodemailer.createTransport({
          ...SAFE_TRANSPORT_OPTIONS,
          host: dev ? 'relay.tamu.edu' : 'smtp-relay.tamu.edu',
          port: 25,
          secure: false,
          ignoreTLS: true
        });
        break;
      case 'gmail':
        // use gmail instead
        Mailer.transporter = nodemailer.createTransport({
          ...SAFE_TRANSPORT_OPTIONS,
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          // The OAuth2 fields sit directly on `auth`. They used to be nested under a `config` key,
          // which nodemailer never read, so nodemailer 10's own types refuse it (#2115). Still
          // empty: this transport is a placeholder that nothing configures.
          auth: {
            type: 'OAuth2',
            user: '',
            accessToken: '',
            clientId: '',
            clientSecret: '',
            refreshToken: ''
          }
        });
        break;
    }

    // `options` is typed for every transport kind, and only SMTP ones have a host; all three here are SMTP.
    console.log('Mailer service initialized. Using host', (Mailer.transporter.options as { host?: string }).host);
  }

  /**
   * Sends a caller's message. Only the allowlisted fields of `email` reach nodemailer, and
   * attachments only as the content of uploaded `files` (#2121).
   */
  public static sendEmail(email: IMailroomEmailOutbound, files: Array<Express.Multer.File> = []) {
    const mailOptions = toMailOptions(email, files);

    // The Multer files are passed down so they can be written to the database.
    const logged = files.length > 0 ? { ...mailOptions, attachments: files } : mailOptions;

    return Mailer.transporter.sendMail(mailOptions).then((response) => Mailer.emailToResponse(response, logged));
  }

  public static emailToResponse(response, email) {
    return {
      response,
      email
    };
  }
}
