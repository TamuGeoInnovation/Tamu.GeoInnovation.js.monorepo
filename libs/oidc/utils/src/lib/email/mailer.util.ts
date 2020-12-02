import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import { User, UserPasswordReset } from '@tamu-gisc/oidc/common';

export class Mailer {
  private static user = 'kaitlyn.schimmel@ethereal.email';
  private static password = 'Pe6D9DhkgUDyqyBMeg';
  private static transporter: Mail = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: Mailer.user,
      pass: Mailer.password
    }
  });

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
      console.log('Verification email: ', Mailer.getTestMessageUrl(response));
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
      console.log('Verification email: ', Mailer.getTestMessageUrl(response));
    });
  }

  public static sendAccountConfirmationEmail(toEmail: string = 'aplecore@gmail.com', sub: string) {
    const mailOptions = {
      from: '"GISC Accounts Team" <giscaccounts@tamu.edu>',
      to: `${toEmail},`,
      subject: 'Your newly created GeoInnovation Service Center account',
      text: 'An account for GeoInnovation Service Center has been created with this email address.',
      html: `An account for GeoInnovation Service Center has been created with this email address. </br><a href="http://localhost:4001/user/register/${sub}">Verify email</a>`
    };

    Mailer.transporter.sendMail(mailOptions).then((response) => {
      console.log('Verification email: ', Mailer.getTestMessageUrl(response));
    });
  }

  public static getTestMessageUrl(response: string | {}) {
    const testUrl = nodemailer.getTestMessageUrl(response);
    console.log('TestURL: ', testUrl);

    return testUrl;
  }
}
