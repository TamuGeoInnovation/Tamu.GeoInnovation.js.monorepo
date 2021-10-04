import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import { User, UserPasswordReset } from '@tamu-gisc/oidc/common';
import { IMailroomEmailOutbound } from '@tamu-gisc/mailroom/common';

export type NodeMailerServices = 'ethereal' | 'gmail' | 'tamu-relay';

const fs = require('fs');
export class Mailer {
  private static transporter: Mail;
  private static service: NodeMailerServices;

  // https://dev.to/chandrapantachhetri/sending-emails-securely-using-node-js-nodemailer-smtp-gmail-and-oauth2-g3a
  // 2LO https://nodemailer.com/smtp/oauth2/#oauth-2lo
  public static build(
    service: NodeMailerServices,
    config?: {
      user: string;
      accessToken: string;
      clientId: string;
      clientSecret: string;
      refreshToken: string;
    }
  ) {
    Mailer.service = service;

    switch (service) {
      case 'ethereal':
        // use ethereal email and print out links to console (debugging / dev)
        Mailer.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: 'kaitlyn.schimmel@ethereal.email',
            pass: 'Pe6D9DhkgUDyqyBMeg'
          }
        });
        break;
      case 'tamu-relay':
        Mailer.transporter = nodemailer.createTransport({
          host: 'smtp-relay.tamu.edu',
          port: 25,
          secure: false,
          ignoreTLS: true
        });
        break;
      case 'gmail':
        // use gmail instead
        Mailer.transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            type: 'OAuth2',
            ...config
          }
        });
        break;
    }
  }

  public static sendEmail(info: IMailroomEmailOutbound, toConsole?: boolean) {
    const mailOptions = {
      to: info.recipientEmail,
      subject: info.subjectLine,
      text: info.emailBodyText,
      html: `<p>${info.emailBodyText}</p>`,
      from: '"GISC Mailroom" <giscaccounts@tamu.edu>'
    };

    if (toConsole) {
      Mailer.transporter.sendMail(mailOptions).then((response) => Mailer.emailToConsole(response));
    } else {
      return Mailer.transporter.sendMail(mailOptions).then((response) => Mailer.emailToResponse(response));
    }
  }

  public static sendEmailWithAttachments(info: IMailroomEmailOutbound, attachments: any[], toConsole?: boolean) {
    const embeddedImages = attachments.map((file) => {
      return {
        filename: file.fieldname,
        content: file.buffer.toString('base64'),
        encoding: 'base64',
        cid: 'unique@nodemailer.com'
      };
    });

    const mailOptions = {
      to: info.recipientEmail,
      subject: info.subjectLine,
      text: info.emailBodyText,
      html: `Embedded image: <img src="cid:unique@nodemailer.com"/></br><p>${info.emailBodyText}</p>`,
      from: '"GISC Mailroom" <giscaccounts@tamu.edu>',
      attachments: embeddedImages
    };

    if (toConsole) {
      Mailer.transporter.sendMail(mailOptions).then((response) => Mailer.emailToConsole(response));
    } else {
      return Mailer.transporter.sendMail(mailOptions).then((response) => Mailer.emailToResponse(response));
    }
  }

  public static sendTokenByEmail(recipient: User, token: string) {
    const mailOptions = {
      from: '"GISC Accounts Team" <giscaccounts@tamu.edu>',
      to: recipient.email,
      subject: 'Your Two-step Login Verification Code',
      text: `Your two-step verification code is: ${token}`,
      html:
        `<p>Your two-step verification code is: <b>${token}</b></p>` + `<p>Use this code to complete loggin in with GISC</p>`
    };

    Mailer.transporter.sendMail(mailOptions).then((response) => Mailer.emailToConsole(response));
  }

  public static sendPasswordResetRequestEmail(recipient: User, resetRequest: UserPasswordReset, location: string) {
    const mailOptions = {
      from: '"GISC Accounts Team" <giscaccounts@tamu.edu>',
      to: recipient.email,
      subject: 'Password reset request',
      text: `A password reset request has been made from the following IP address: ${resetRequest.initializerIp} originating from ${location}`,
      html:
        `<p>A password reset request has been made from the following IP address: <b>${resetRequest.initializerIp}</b> originating from <b>${location}</b>.</p>` +
        `<p>If this was a legitimate password reset request please click on the link below:</p>` +
        `<a href="http://localhost:4001/user/pwr/${resetRequest.token}">Reset my password</a>` +
        `<p>If you did <b>NOT</b> request to reset your password click the following link:</p>` +
        `<a href="">Report fraudulent reset request</a>`
    };

    Mailer.transporter.sendMail(mailOptions).then((response) => Mailer.emailToConsole(response));
  }

  public static sendPasswordResetConfirmationEmail(toEmail: string) {
    const mailOptions = {
      from: '"GISC Accounts Team" <giscaccounts@tamu.edu>',
      to: `${toEmail},`,
      subject: 'GeoInnovation Service Center password reset',
      text: 'Your password to GeoInnovation Service Center has been reset.',
      html: 'Your password to GeoInnovation Service Center has been reset.'
    };

    Mailer.transporter.sendMail(mailOptions).then((response) => Mailer.emailToConsole(response));
  }

  public static sendAccountConfirmationEmail(toEmail: string, sub: string) {
    const mailOptions = {
      from: '"GISC Accounts Team" <giscaccounts@tamu.edu>',
      to: `${toEmail},`,
      subject: 'Your newly created GeoInnovation Service Center account',
      text: 'An account for GeoInnovation Service Center has been created with this email address.',
      html: `An account for GeoInnovation Service Center has been created with this email address. </br><a href="http://localhost:4001/user/register/${sub}">Verify email</a>`
    };

    Mailer.transporter.sendMail(mailOptions).then((response) => Mailer.emailToConsole(response));
  }

  public static emailToConsole(response) {
    if (Mailer.service == 'ethereal') {
      console.log('Ethereal: ', nodemailer.getTestMessageUrl(response));
    }
  }

  public static emailToResponse(response) {
    if (Mailer.service == 'ethereal') {
      // console.log('Ethereal: ', nodemailer.getTestMessageUrl(response));
      return nodemailer.getTestMessageUrl(response);
    } else {
      return;
    }
  }
}
