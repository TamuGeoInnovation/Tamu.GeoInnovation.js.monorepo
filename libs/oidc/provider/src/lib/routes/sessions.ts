import express from 'express';
import Provider from 'oidc-provider';

import { SessionManager } from '../sequelize/session_manager';

export const session_routes = (app: express.Application, provider: Provider) => {
  app.get('/sessions', async (req, res, next) => {
    const sessions = await SessionManager.getSessions();
    res
      .set('Access-Control-Allow-Origin', '*')
      .status(200)
      .send(sessions);
  });
};
