import express, { NextFunction, Response, Request } from 'express';
import { authenticator } from 'otplib';
import Provider from 'oidc-provider';

import { AccountManager } from '../sequelize/account_manager';
import { TwoFactorAuthUtils } from '../_utils/twofactorauth.util';
import { GISCEmailer } from '../mailer';

export const accounts_routes = (app: express.Application, provider: Provider) => {
  app.get('/accounts', async (req: Request, res: Response, next: NextFunction) => {
    const accounts = await AccountManager.getAllAccounts();
    res
      .set('Access-Control-Allow-Origin', '*')
      .status(200)
      .send(accounts);
  });

  app.get('/accounts/:sub', async (req: Request, res: Response, next: NextFunction) => {
    const sub = req.params.sub;
    const account = await AccountManager.getAccount(sub);
    res
      .set('Access-Control-Allow-Origin', '*')
      .status(200)
      .send({
        // uin_tamu: account.uin_tamu,
        // sub: account.sub,
        // fieldofstudy_tamu: account.fieldofstudy_tamu,
        // department_tamu: account.department_tamu,
        // classification_tamu: account.classification_tamu,
        ...account
      });
  });

  app.post('/accounts/update/:sub', async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const update = await AccountManager.updateAccount(data);
    res.status(200).send({ success: true });
  });

  app.post('/accounts/register', async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    await AccountManager.registerAccount(data, data.siteGuid);
    // TODO: SEND VERIFICATION EMAIL TO REGISTEREE'S EMAIL
    GISCEmailer.sendAccountConfirmationEmail(data.email, data.sub);
    // TODO: ONLY RUN registerTAMUAccount IF IT'S AN ACTUAL TAMU ACCOUNT
    // AT THE MOMEMT THIS IS INSERTING A BUNCH OF NULL VALUES INTO accounts_tamus TABLE
    await AccountManager.registerTAMUAccount(data);
    await AccountManager.registerUser(data);
    await AccountManager.addUserRole(data.siteGuid, 3, data.sub);
    await AccountManager.insertSecretAnswer(data.sub, data.first_question_id, data.first_question_answer);
    await AccountManager.insertSecretAnswer(data.sub, data.second_question_id, data.second_question_answer);

    res.status(200).send({ success: true });
  });

  app.get('/accounts/register/:id', async (req: Request, res: Response, next: NextFunction) => {
    AccountManager.verifyUserEmail(req.params.id);
    res.send({ email_verified: true });
  });

  app.post('/accounts/register/sendVerification', async (req: Request, res: Response, next: NextFunction) => {
    GISCEmailer.sendAccountConfirmationEmail(req.body.email, req.body.sub);
    res.send("We've sent you a verification email to the email you registered with");
  });

  app.get('/accounts_sqs', async (req: Request, res: Response, next: NextFunction) => {
    const questions = await AccountManager.getAllSecretQuestions();
    res.status(200).json(questions);
  });

  app.get('/accounts/:sub/sqs', async (req: Request, res: Response, next: NextFunction) => {
    const questions = await AccountManager.getSecretQuestionsByUserSub(req.params.sub);
    res.status(200).json(questions);
  });

  app.get('/pwr/:token', async (req: Request, res: Response, next: NextFunction) => {
    const token = req.params.token;

    // CHECK FOR A VALID ENTRY IN THE PW RESET TABLE
    const valid: any = await AccountManager.isResetLinkStillValid(token);
    const account: any = await AccountManager.getAccount(valid.account_sub);
    const user: any = await AccountManager.getUser(valid.account_sub);

    // SOMEHOW COMPARE THE COUNTRY OR SOMETHING OF THE SIGNUP IP TO THAT OF THE
    // RESET REQUEST TO SEE IF THEY'RE THE SAME
    // MAYBE BLACK LIST SOME COUNTRIES (Russia, China, India)

    // const IPSTACK_APIKEY = "1e599a1240ca8f99f0b0d81a08324dbb";
    // const IPSTACK_URL = "http://api.ipstack.com/";

    // rp.get(`${IPSTACK_URL}${req.ip},${account.signup_ip_address}?access_key=${IPSTACK_APIKEY}`).then(response => {
    //   const locations = JSON.parse(response);
    //   // TODO: YOU NEED TO PAY IPSTACK FOR BATCH ACCESS
    //   debugger

    // });
    if (user.enabled2fa) {
      res.render('2fa-auth-alt', {
        sub: valid.account_sub,
        token,
        error: false,
        message: 'Invalid token, try again'
      });
    } else if (valid) {
      // res.status(200).send({id: id});
      const questionsAndAnswers: any = await AccountManager.getSecretQuestionsByUserSub(valid.account_sub);
      const questions: {}[] = [];
      questionsAndAnswers.forEach((set: any) => {
        questions.push({
          text: set.question_text,
          id: set.id
        });
      });

      res.render('password-reset', {
        sub: valid.account_sub,
        token,
        questions
      });
    } else {
      // The link has expired; should we delete from the table at this point?
      res.status(200).send('The link you used to reset your password has expired; please request a new link');
    }
  });

  app.post('/pwr/:token/2fa', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.params.token;
      const inputToken = req.body.token;

      const valid: any = await AccountManager.isResetLinkStillValid(token);
      const user: any = await AccountManager.getUser(valid.account_sub);

      const isValid = TwoFactorAuthUtils.isValid(inputToken, user.secret2fa);
      if (isValid) {
        const questionsAndAnswers: any = await AccountManager.getSecretQuestionsByUserSub(valid.account_sub);
        const questions: {}[] = [];

        // FIXME: THERE *MAY* BE A CASE IN WHICH THERE ARE NO SECRET QUESTION ANSWERS such as the atharmon@tamu.edu account
        questionsAndAnswers.forEach((set: any) => {
          questions.push({
            text: set.question_text,
            id: set.id
          });
        });

        res.render('password-reset', {
          token,
          questions,
          sub: valid.account_sub
        });
      } else {
        res.render('2fa-auth-alt', {
          token,
          sub: valid.account_sub,
          error: true,
          message: 'Invalid token, try again'
        });
      }
    } catch (error) {
      res.render('2fa-auth-alt', {
        sub: req.body.sub,
        token: req.params.token,
        error: true,
        message: 'Invalid token, try again'
      });
    }
  });

  app.post('/pwr/:token', async (req: Request, res: Response, next: NextFunction) => {
    const token = req.params.token;
    const { answer1, answer2, sub, question1, question2 } = req.body;
    const exactMatch1 = AccountManager.compareSecretAnswers(token, question1, answer1);
    const exactMatch2 = AccountManager.compareSecretAnswers(token, question2, answer2);
    Promise.all([exactMatch1, exactMatch2])
      .then((results) => {
        if (results[0] == true && results[1] == true) {
          res.render('new-password', {
            token
          });
        } else {
          // One of the answers was incorrect
          // TODO: WE SHOULD PROBABLY DO SOMETHING HERE
          console.log('Incorrect secret question answer');
        }
      })
      .catch((error) => {
        console.error(error);
      });
    // if(exactMatch) {
    //   AccountManager.updateUserPassword("", "");
    // }
    // res.status(200).send(exactMatch);
  });

  app.post('/npw/:id', async (req: Request, res: Response, next: NextFunction) => {
    AccountManager.getPWResetRecord(req.body.token)
      .then((userSub: any) => {
        AccountManager.updateUserPassword(userSub[0].account_sub, req.body.newPassword)
          .then((updated) => {
            // TODO: SEND EMAIL TO USER SAYING PASSWORD WAS RESET

            // TODO: IS THIS CALLING deletePWResetToken twice?
            const deleteToken = AccountManager.deletePWResetToken(req.body.token);
            // TODO: SEND TO THE ACTUAL EMAIL ADDRESS
            Promise.all([GISCEmailer.sendPasswordResetConfirmationEmail(''), deleteToken])
              .then((results) => {
                res.status(200).send({ testUrl: GISCEmailer.getTestMessageUrl(results[0]) });
              })
              .catch((error) => {
                console.error(error);
              });
          })
          .catch((error) => {
            console.error(error);
          });
      })
      .catch((error) => {
        console.error(error);
      });

    // res.send(200).send("Done");
  });

  app.get('/accounts/2fa/enable/:sub', async (req: Request, res: Response, next: NextFunction) => {
    AccountManager.enable2FA(req.params.sub)
      .then((result: any) => {
        console.log('Secret: ', result.secret);
        const issuer = 'TAMU GeoInnovation';
        const otpPath = authenticator.keyuri(encodeURIComponent(result.email), encodeURIComponent(issuer), result.secret);
        res.render('2fa-scan', {
          title: '2FA',
          otpPath: JSON.stringify(otpPath)
        });
      })
      .catch((error) => {
        console.error(error);
      });
  });

  app.get('/accounts/2fa/disable/:sub', async (req: Request, res: Response, next: NextFunction) => {
    AccountManager.disable2FA(req.params.sub);
    res.send(200).send();
  });

  // // TODO: LOCK THIS ENDPOINT BEHIND SOME SORT OF PASSPORT AUTHORIZATION MIDDLEWARE
  // app.get("/admin/roles", async (req, res, next) => {
  //   const admin = await AccountManager.createNewRole(99, "Administrator");
  //   const manager = await AccountManager.createNewRole(90, "Manager");
  //   const user = await AccountManager.createNewRole(10, "User");
  //   const guest = await AccountManager.createNewRole(1, "Guest");
  //   Promise.all([admin, manager, user, guest]).then(results => {
  //     res.status(200).send({ operation: "success" })
  //   }).catch(error => {
  //     res.status(500).send({ operation: "failed" })
  //   });

  // })

  // app.get("/admin/userroles", async (req, res, next) => {
  //   const add = await AccountManager.addUserRole("", 3, "3", "5b0e9b00-1441-41bc-9a0c-94665014de3f");
  //   add.then(result => {
  //     res.status(200).send({ operation: "success" })
  //   }).catch(error => {
  //     res.status(500).send({ operation: "failed" })
  //   })
  // })

  // app.get("/admin/userrole/:userGuid", async (req, res, next) => {
  //   OIDCAccount.getAccountAccess(req.params.userGuid).then((result: any) => {
  //     debugger
  //     res.status(200).send({
  //       role: result.access_control_role.name,
  //       name: result.account.name,
  //     })
  //   }).catch(error => {
  //     debugger
  //     res.status(500).send({ operation: "failed" })
  //   })
  // })
};
