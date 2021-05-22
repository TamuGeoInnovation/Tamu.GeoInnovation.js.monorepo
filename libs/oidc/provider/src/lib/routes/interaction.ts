import express, { NextFunction, Response, Request, urlencoded } from 'express';
import Provider, { IClient, Session } from 'oidc-provider';
import request from 'request';
import cors from 'cors';
import { v4 as guid } from 'uuid';
import { authenticator } from 'otplib';
import nodemailer from 'nodemailer';
import { sign, decode, Secret } from 'jsonwebtoken';

import { AccountManager } from '../sequelize/account_manager';
import { TwoFactorAuthUtils } from '../_utils/twofactorauth.util';
import { DbManager } from '../sequelize/DbManager';
import { LoginManager } from '../sequelize/login_manager';
import { urlHas, urlFragment } from '../_utils/url-utils';
import { ParsedUrlQuery } from 'querystring';

const querystring = require('querystring');
const body = urlencoded({ extended: false });

export const interaction_routes = (app: express.Application, provider: Provider) => {
  app.use((req, res, next) => {
    const orig = res.render;
    res.render = (view, locals) => {
      app.render(view, locals, (err, html) => {
        if (err) throw err;
        if (locals.view === 'user-info') {
          orig.call(res, '_layout', {
            ...locals,
            body: html
          });
        } else if (locals.view === '2fa') {
          orig.call(res, '2fa-scan');
        } else if (locals.view === 'authorize') {
          orig.call(res, '_layout', {
            ...locals,
            body: html
          });
        }
      });
    };
    next();
  });

  function setNoCache(req: Request, res: Response, next: NextFunction) {
    res.set('Pragma', 'no-cache');
    res.set('Cache-Control', 'no-cache, no-store');
    next();
  }

  app.get('/auth', cors(), (req: Request, res: Response, next: NextFunction) => {
    next();
  });

  app.get('/interaction/:grant', setNoCache, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const details = await provider.interactionDetails(req);
      const client = await provider.Client.find(details.params.client_id);

      // HERE WE LOOK IN THE BAD LOGIN TABLE TO SEE IF WE HAVE A MATCH WITH THIS GRANT ID
      const previousLoginAttempt = await LoginManager.getUserLoginAttempt(req.params.grant);

      if (previousLoginAttempt) {
        const props: RenderProps = {
          view: 'user-info',
          title: 'Geoservices Login',
          client,
          details,
          error: true,
          message: 'Invalid email or password combination.',
          params: querystring.stringify(details.params, ',<br/>', ' = ', {
            encodeURIComponent: (value) => value
          }),
          interaction: querystring.stringify(details.interaction, ',<br/>', ' = ', {
            encodeURIComponent: (value) => value
          }),
          devMode: urlHas(req.path, 'dev', true),
          requestingHost: urlFragment(client.redirectUris[0], 'hostname')
        };

        return res.render('user-info', props);
      } else if (details.interaction.error === 'login_required') {
        const props: RenderProps = {
          view: 'user-info',
          title: 'GeoInnovation Service Center SSO',
          client,
          details,
          error: false,
          params: querystring.stringify(details.params, ',<br/>', ' = ', {
            encodeURIComponent: (value) => value
          }),
          interaction: querystring.stringify(details.interaction, ',<br/>', ' = ', {
            encodeURIComponent: (value) => value
          }),
          devMode: urlHas(req.path, 'dev', true),
          requestingHost: urlFragment(client.redirectUris[0], 'hostname')
        };

        return res.render('user-info', props);
      } else {
        const props: RenderProps = {
          client,
          details,
          view: 'authorize',
          title: 'Authorize',
          params: querystring.stringify(details.params, ',<br/>', ' = ', {
            encodeURIComponent: (value) => value
          }),
          interaction: querystring.stringify(details.interaction, ',<br/>', ' = ', {
            encodeURIComponent: (value) => value
          }),
          requestingHost: urlFragment(client.redirectUris[0], 'hostname'),
          devMode: urlHas(req.path, 'dev', true)
        };

        return res.render('interaction', props);
      }
    } catch (err) {
      return next(err);
    }
  });

  app.post('/interaction/:grant', setNoCache, body, async (req: Request, res: Response, next: NextFunction) => {
    const details = await provider.interactionDetails(req);
    const client = await provider.Client.find(details.params.client_id);

    const user = await AccountManager.findUser(req.body.login, req.body.password);
    if (user) {
      const ipAddress = req.ip;
      LoginManager.insertNewUserLogin(req.params.grant, req.body.login, req.ip, user.user.sub);
      AccountManager.updateAccountLastIPAddress(user.user.sub, ipAddress);
      const isVerified = await AccountManager.isAccountEmailVerified(user.user.sub);
      if (isVerified) {
        // USER HAS VERIFIED THEIR EMAIL, PROCEED TO 2FA if need be
        if (user.user.enabled2fa) {
          // USER IS VERIFIED AND HAS ENABLED 2fa

          const result = {
            login: {
              account: user.user.sub,
              acr: 'urn:mace:incommon:iap:bronze',
              amr: ['pwd'],
              remember: !!req.body.remember,
              ts: Math.floor(Date.now() / 1000)
            },
            consent: {}
          };

          const props: RenderProps = {
            view: 'user-info',
            title: 'Sign-in',
            client,
            details,
            email: user.user.email,
            sub: user.user.sub,
            error: false,
            result: JSON.stringify(result),
            params: querystring.stringify(details.params, ',<br/>', ' = ', {
              encodeURIComponent: (value) => value
            }),
            interaction: querystring.stringify(details.interaction, ',<br/>', ' = ', {
              encodeURIComponent: (value) => value
            })
          };

          return res.render('2fa-auth', props);
        } else {
          // USER IS VERIFIED BUT NO 2fa
          const result = {
            login: {
              account: user.user.sub,
              acr: 'urn:mace:incommon:iap:bronze',
              amr: ['pwd'],
              remember: !!req.body.remember,
              ts: Math.floor(Date.now() / 1000)
            },
            consent: {}
          };

          await provider.interactionFinished(req, res, result);
        }
      } else {
        // USER HAS NOT VERIFIED EMAIL, SHOW THE THINGY TO LET THEM REQUEST A NEW ONE

        const props: RenderProps = {
          view: 'user-info',
          title: 'Sign-in',
          client,
          details,
          email: user.user.email,
          sub: user.user.sub,
          error: false,
          params: querystring.stringify(details.params, ',<br/>', ' = ', {
            encodeURIComponent: (value) => value
          }),
          interaction: querystring.stringify(details.interaction, ',<br/>', ' = ', {
            encodeURIComponent: (value) => value
          })
        };

        return res.render('not-verified', props);
      }
    } else {
      // TODO: LOG AN INCORRECT LOGIN ATTEMPT HERE
      LoginManager.insertNewUserLogin(req.params.grant, req.body.login, req.ip);
      return res.redirect(`/interaction/${req.params.grant}`);
    }
  });

  app.post('/interaction/:grant/2fa', setNoCache, body, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inputToken = req.body.token;
      const user = await AccountManager.getUser(req.body.sub);
      const isValid = TwoFactorAuthUtils.isValid(inputToken, user.secret2fa);
      if (isValid) {
        const result = JSON.parse(req.body.result);
        // LoginManager.insertNewUserLogin(req.params.grant, req.body.email, req.ip, req.body.sub);
        await provider.interactionFinished(req, res, result);
      } else {
        // TODO: LOG THE INCORRECT 2FA CODE
        const details = await provider.interactionDetails(req);
        const client = await provider.Client.find(details.params.client_id);

        const props: RenderProps = {
          view: 'user-info',
          title: 'Sign-in',
          client,
          details,
          email: req.body.email,
          sub: req.body.sub,
          error: true,
          message: 'Invalid 2fa token',
          // type: 'invalid-token',
          result: req.body.result,
          params: querystring.stringify(details.params, ',<br/>', ' = ', {
            encodeURIComponent: (value) => value
          }),
          interaction: querystring.stringify(details.interaction, ',<br/>', ' = ', {
            encodeURIComponent: (value) => value
          })
        };

        return res.render('2fa-auth', props);
      }
    } catch (error) {
      console.error(error);
      // THIS OCCURS WHEN THE TOKEN PROVIDED IS LESS THAN OR MORE THAN 6 CHARS
      const details = await provider.interactionDetails(req);
      const client = await provider.Client.find(details.params.client_id);

      const props: RenderProps = {
        view: 'user-info',
        title: 'Sign-in',
        client,
        details,
        email: req.body.email,
        sub: req.body.sub,
        error: true,
        message: 'Invalid 2fa token',
        // type: 'invalid-token',
        result: req.body.result,
        params: querystring.stringify(details.params, ',<br/>', ' = ', {
          encodeURIComponent: (value) => value
        }),
        interaction: querystring.stringify(details.interaction, ',<br/>', ' = ', {
          encodeURIComponent: (value) => value
        })
      };

      return res.render('2fa-auth', props);
    }
  });

  app.post('/interaction/:grant/confirm', setNoCache, body, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = { consent: {} };
      await provider.interactionFinished(req, res, result);
    } catch (err) {
      next(err);
    }
  });

  app.post('/interaction/:grant/login', setNoCache, body, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await AccountManager.findUser(req.body.login, req.body.password);
      const remember = !!req.body.remember;
      if (user) {
        const result = {
          login: {
            account: user.user.sub,
            acr: 'urn:mace:incommon:iap:bronze',
            amr: ['pwd'],
            remember: remember,
            ts: Math.floor(Date.now() / 1000)
          },
          consent: {}
        };

        await provider.interactionFinished(req, res, result);
      } else {
        // const tempSession = await provider.setProviderSession(req, res, {
        //   error: "Could not find user"
        // })
        next();
      }
    } catch (err) {
      next(err);
    }
  });

  app.get('/logout', setNoCache, body, async (req, res, next) => {
    // https://openid.net/specs/openid-connect-backchannel-1_0.html
    const expressReq = req;
    const decoded = decode(req.body.id_token_hint);
    const redirect_uri = req.body.post_logout_redirect_uris;
    const logoutTokenDecrypted = {
      iss: decoded.iss,
      sub: decoded.sub,
      aud: decoded.aud,
      iat: decoded.iat,
      jti: '',
      events: {
        'http://schemas.openid.net/event/backchannel-logout': {}
      },
      sid: decoded.sid
    };

    const key: Secret = {
      key: 'k',
      passphrase: ''
    };

    const logoutJWS = sign(logoutTokenDecrypted, key, {
      algorithm: 'RSA256'
    });

    request.post(redirect_uri, {
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      form: {
        logout_token: logoutJWS
      }
    });
  });

  // TODO: MOVE THIS TO THE GISCEMAILER CLASS
  app.get('/forgotpassword/:sub', setNoCache, async (req: Request, res: Response, next: NextFunction) => {
    const IPSTACK_APIKEY = '';
    const IPSTACK_URL = '';
    const ip = ''; // change eventually to req.ip

    const etherealAccount = {
      user: '',
      pass: ''
    };
    const transporter = nodemailer.createTransport({
      host: '',
      port: 587,
      secure: false,
      auth: {
        user: etherealAccount.user,
        pass: etherealAccount.pass
      }
    });
    const account = await AccountManager.getAccount(req.params.sub);

    // rp.get(`${IPSTACK_URL}${ip}?access_key=${IPSTACK_APIKEY}`).then((response) => {
    //   const location = JSON.parse(response);
    //   const token = uuidv4();
    //   let mailOptions = {
    //     from: '"GISC Accounts Team" <giscaccounts@tamu.edu>',
    //     to: `${account.email}`,
    //     subject: 'Password reset request',
    //     text: `A password reset request has been made from the following IP address: ${req.ip} originating from ${location.country_name}`,
    //     html:
    //       `<p>A password reset request has been made from the following IP address: <b>${req.ip}</b> originating from <b>${location.country_name}</b>.</p>` +
    //       `<p>If this was a legitimate password reset request please click on the link below:</p>` +
    //       `<a href="http://localhost:4001/pwr/${token}">Reset my password</a>` +
    //       `<p>If you did <b>NOT</b> request to reset your password click the following link:</p>` +
    //       `<a href="">Report fraudulent reset request</a>`
    //   };
    //   transporter.sendMail(mailOptions).then((response) => {
    //     AccountManager.insertNewPWResetRequest(req.params.sub, token, req.ip);
    //     res.send({
    //       messageSent: response.messageId,
    //       preview: nodemailer.getTestMessageUrl(response)
    //     });
    //   });
    // });
  });

  // TODO: REMOVE THIS ROUTE
  app.get('/2fa', setNoCache, async (req: Request, res: Response, next: NextFunction) => {
    // authenticator.options = { crypto };
    // const secret = authenticator.encode("JE2VQ432IFHGM5RVOJ2VK2TOIN2TM3KI");
    // const user = "atharmon@tamu.edu";
    // const service = "accounts.geoservices.tamu.edu";
    // const otpauth = authenticator.keyuri(encodeURIComponent(user), encodeURIComponent(service), secret);
    // TODO: THIS GENERATES A QR IMAGE FOR ATHARMON@TAMU.EDU; SHOULD BE GENERALIZED EVENTUALLY
    const ret: RenderProps = {
      view: '2fa',
      title: '2FA'
    };

    res.render('2fa-scan', ret);
    // const canvas = document.getElementById('canvas');
    // QRCode.toCanvas(canvas, otpauth).catch(error => {
    //   console.error(error);
    // });

    // QRCode.toDataURL(otpauth, (error, imageUrl) => {
    //   if(error) {
    //     console.log("Error with QR");
    //     return;
    //   }
    //   // res.send({
    //   //   qrcode: imageUrl
    //   // })
    // });
  });

  provider.use(async (ctx, next) => {
    console.log('middleware pre', ctx.method, ctx.path);
    await next();
    try {
      if (ctx.path === '/token/introspection') {
        // TODO: UPDATE THE EXPIRES_AT TO BE DATE.NOW() + AN HOUR // THIS IS DONE
        if (ctx.oidc.entities.AccessToken) {
          const { grantId, accountId: sub } = ctx.oidc.entities.AccessToken;
          const access_tokens = DbManager.db.AccessTokens;
          const additionalTimeInMilliseconds = 3 * 60 * 60 * 1000; // should be 3 hours
          access_tokens.update(
            {
              expiresAt: new Date(Date.now() + additionalTimeInMilliseconds).toISOString()
            },
            {
              where: {
                grantId
              }
            }
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  });

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err.name === 'SessionNotFound') {
      // handle interaction expired / session not found error
    }
    next(err);
  });
};

interface RenderProps {
  view: 'user-info' | '2fa' | 'authorize';
  title: string;
  client?: IClient;
  details?: Session;
  email?: string;
  sub?: string;
  error?: boolean;
  message?: string;
  result?: unknown;
  params?: string;
  interaction?: string;
  devMode?: boolean;
  requestingHost?: string | boolean | ParsedUrlQuery;
}
