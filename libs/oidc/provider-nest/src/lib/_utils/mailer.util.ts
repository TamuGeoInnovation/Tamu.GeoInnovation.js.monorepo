import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

export class Mailer {
  private static user: string = 'kaitlyn.schimmel@ethereal.email';
  private static password: string = 'Pe6D9DhkgUDyqyBMeg';
  private static transporter: Mail = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: Mailer.user,
      pass: Mailer.password
    }
  });
  static async sendPasswordResetConfirmationEmail(toEmail: string = 'aplecore@gmail.com'): Promise<any> {
    let mailOptions = {
      from: '"GISC Accounts Team" <giscaccounts@tamu.edu>',
      to: `${toEmail},`,
      subject: 'GeoInnovation Service Center password reset',
      text: 'Your password to GeoInnovation Service Center has been reset.',
      html: 'Your password to GeoInnovation Service Center has been reset.'
    };
    return new Promise((resolve, reject) => {
      Mailer.transporter
        .sendMail(mailOptions)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  static async sendAccountConfirmationEmail(toEmail: string = 'aplecore@gmail.com', sub: string): Promise<any> {
    let mailOptions = {
      from: '"GISC Accounts Team" <giscaccounts@tamu.edu>',
      to: `${toEmail},`,
      subject: 'Your newly created GeoInnovation Service Center account',
      text: 'An account for GeoInnovation Service Center has been created with this email address.',
      html: `An account for GeoInnovation Service Center has been created with this email address. </br><a href="http://localhost:4001/user/register/${sub}">Verify email</a>`
    };
    return new Promise((resolve, reject) => {
      Mailer.transporter
        .sendMail(mailOptions)
        .then((response) => {
          console.log('Verification email: ', Mailer.getTestMessageUrl(response));
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  static async getTestMessageUrl(response: any) {
    let testUrl = nodemailer.getTestMessageUrl(response);
    console.log('TestURL: ', testUrl);
    return testUrl;
  }
}
