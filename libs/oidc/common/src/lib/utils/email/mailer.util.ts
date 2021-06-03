import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import { User, UserPasswordReset } from '@tamu-gisc/oidc/common';

export type NodeMailerServices = 'ethereal' | 'gmail';
export class Mailer {
  private static transporter: Mail;
  private static service: NodeMailerServices;

  // https://dev.to/chandrapantachhetri/sending-emails-securely-using-node-js-nodemailer-smtp-gmail-and-oauth2-g3a
  // 2LO https://nodemailer.com/smtp/oauth2/#oauth-2lo
  public static build(service: NodeMailerServices, config?: {}) {
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

  public static sendTokenByEmail(recipient: User, token: string) {
    const mailOptions = {
      from: '"GISC Accounts Team" <giscaccounts@tamu.edu>',
      to: recipient.email,
      subject: 'Your Two-step Login Verification Code',
      text: `Your two-step verification code is: ${token}`,
      html:
        `<p>Your two-step verification code is: <b>${token}</b></p>` + `<p>Use this code to complete loggin in with GISC</p>`
    };

    Mailer.transporter.sendMail(mailOptions).then((response) => {
      if (Mailer.service == 'ethereal') {
        console.log('Ethereal: ', nodemailer.getTestMessageUrl(response));
      }
    });
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

    Mailer.transporter.sendMail(mailOptions).then((response) => {
      if (Mailer.service == 'ethereal') {
        console.log('Ethereal: ', nodemailer.getTestMessageUrl(response));
      }
    });
  }

  public static sendPasswordResetConfirmationEmail(toEmail: string) {
    const mailOptions = {
      from: '"GISC Accounts Team" <giscaccounts@tamu.edu>',
      to: `${toEmail},`,
      subject: 'GeoInnovation Service Center password reset',
      text: 'Your password to GeoInnovation Service Center has been reset.',
      html: 'Your password to GeoInnovation Service Center has been reset.'
    };

    Mailer.transporter.sendMail(mailOptions).then((response) => {
      if (Mailer.service == 'ethereal') {
        console.log('Ethereal: ', nodemailer.getTestMessageUrl(response));
      }
    });
  }

  public static sendAccountConfirmationEmail(toEmail: string, sub: string) {
    const mailOptions = {
      from: '"GISC Accounts Team" <giscaccounts@tamu.edu>',
      to: `${toEmail},`,
      subject: 'Your newly created GeoInnovation Service Center account',
      text: 'An account for GeoInnovation Service Center has been created with this email address.',
      html: `An account for GeoInnovation Service Center has been created with this email address. </br><a href="http://localhost:4001/user/register/${sub}">Verify email</a>`
    };

    Mailer.transporter.sendMail(mailOptions).then((response) => {
      if (Mailer.service == 'ethereal') {
        console.log('Ethereal: ', nodemailer.getTestMessageUrl(response));
      }
    });
  }
}
