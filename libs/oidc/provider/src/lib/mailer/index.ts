import nodemailer, { Mail } from 'nodemailer';

export class GISCEmailer {
  private static user = '';
  private static password = '';
  private static transporter: Mail = nodemailer.createTransport({
    host: '',
    port: 587,
    secure: false,
    auth: {
      user: GISCEmailer.user,
      pass: GISCEmailer.password
    }
  });
  public static async sendPasswordResetConfirmationEmail(toEmail: string = ''): Promise<any> {
    const mailOptions = {
      from: '"GISC Accounts Team" <giscaccounts@tamu.edu>',
      to: `${toEmail},`,
      subject: 'GeoInnovation Service Center password reset',
      text: 'Your password to GeoInnovation Service Center has been reset.',
      html: 'Your password to GeoInnovation Service Center has been reset.'
    };
    return new Promise((resolve, reject) => {
      GISCEmailer.transporter
        .sendMail(mailOptions)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  public static async sendAccountConfirmationEmail(toEmail: string = '', sub: string): Promise<any> {
    const mailOptions = {
      from: '"GISC Accounts Team" <giscaccounts@tamu.edu>',
      to: `${toEmail},`,
      subject: 'Your newly created GeoInnovation Service Center account',
      text: 'An account for GeoInnovation Service Center has been created with this email address.',
      html: `An account for GeoInnovation Service Center has been created with this email address. </br><a href="http://localhost:4001/accounts/register/${sub}">Verify email</a>`
    };
    return new Promise((resolve, reject) => {
      GISCEmailer.transporter
        .sendMail(mailOptions)
        .then((response) => {
          console.log('Verification email: ', GISCEmailer.getTestMessageUrl(response));
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  public static async getTestMessageUrl(response: any) {
    const testUrl = nodemailer.getTestMessageUrl(response);
    console.log('TestURL: ', testUrl);
    return testUrl;
  }
}
