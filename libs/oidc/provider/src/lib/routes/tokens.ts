import express from 'express';
import Provider from 'oidc-provider';

import { TokenManager } from '../sequelize/token_manager';

export const token_routes = (app: express.Application, provider: Provider) => {
  app.get('/tokens/access', async (req, res, next) => {
    const tokens = await TokenManager.getAccessTokens();
    res
      .set('Access-Control-Allow-Origin', '*')
      .status(200)
      .send(tokens);
  });
};
