export const environment = {
  production: true
};

export { prodConfig as dbConfig } from './ormconfig';
export { jwtSecretProd as jwtSecret } from './secrets';
