import { Router } from 'express';

export interface IModelRoutes {
  router: Router;
  setupRoutes(): void;
}
