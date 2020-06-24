import express from 'express';
import { v4 as guid } from 'uuid';
import Provider from 'oidc-provider';

import { SiteManager } from '../sequelize/site_manager';

export const sites_routes = (app: express.Application, provider: Provider) => {
  app.get('/sites', async (req, res, next) => {
    const sites = await SiteManager.getSites();
    res
      .set('Access-Control-Allow-Origin', '*')
      .status(200)
      .send(sites);
  });

  app.get('/sites/:siteGuid', async (req, res, next) => {
    const siteGuid = req.params.siteGuid;
    // const account:any = await NewAccount.getAccountTAMU(sub);
    // res.set("Access-Control-Allow-Origin", "*").status(200).send({
    //   uin_tamu: account.uin_tamu,
    //   sub: account.sub,
    //   fieldofstudy_tamu: account.fieldofstudy_tamu,
    //   department_tamu: account.department_tamu,
    //   classification_tamu: account.classification_tamu,
    //   ...account.dataValues,
    //   // ...account
    // });
  });

  app.get('/sites/user/:userGuid', async (req, res, next) => {
    const userGuid = req.params.userGuid;
    const sites = await SiteManager.getSitesWithUserAccess(userGuid);
    res
      .set('Access-Control-Allow-Origin', '*')
      .status(200)
      .send(sites);
  });

  app.post('/sites/add', async (req, res, next) => {
    const data = req.body;
    if (data.guid == null || data.guid === undefined) {
      data.siteGuid = guid();
    }
    const add = await SiteManager.addSite(data);
    res.status(200).send({ success: true });
  });

  app.post('/sites/access/update', async (req, res, next) => {
    const data = req.body;
    const update = await SiteManager.updateSiteAccess(data.roleId, data.userGuid, data.siteGuid);
    res.status(200).send({ success: true });
  });
};
