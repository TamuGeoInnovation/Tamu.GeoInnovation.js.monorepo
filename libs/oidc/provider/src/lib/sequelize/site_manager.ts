import { DbManager } from './DbManager';
import { ISiteAccess, ISiteAttrs } from '../models/Sites/sites';

export class SiteManager {
  public static async ensureDbIsSynced() {
    if (!DbManager.db) {
      DbManager.setup();
    }
  }

  public static async addSite(site: ISiteAttrs) {
    return new Promise((resolve, reject) => {
      const sites = DbManager.db.Sites;
      sites
        .upsert({
          siteGuid: site.siteGuid,
          siteName: site.siteName
        })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async getSites() {
    return new Promise((resolve, reject) => {
      const sites = DbManager.db.Sites;
      sites
        .findAll()
        .then((s) => {
          resolve(s);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async getSitesWithUserAccess(userGuid: string) {
    return new Promise((resolve, reject) => {
      const sites = DbManager.db.Sites;
      const userRoles = DbManager.db.UserRolesAC;
      const roles = DbManager.db.RolesAC;

      // userRoles.hasOne(sites, {
      //   foreignKey: "siteGuid",
      // });

      // sites.belongsTo(userRoles, {
      //   foreignKey: "siteGuid",
      //   targetKey: "siteGuid",
      // });

      // userRoles.hasOne(roles, {
      //   foreignKey: "id",
      // });

      sites.hasOne(userRoles, {
        foreignKey: 'siteGuid'
      });

      roles.hasOne(userRoles, {
        foreignKey: 'roleId'
      });

      userRoles.belongsTo(sites, {
        foreignKey: 'siteGuid'
      });

      userRoles.belongsTo(roles, {
        foreignKey: 'roleId'
      });

      DbManager.db.sequelize.sync().then(() => {
        userRoles
          .findAll({
            include: [
              {
                model: sites
              },
              {
                model: roles
              }
            ],
            where: {
              userGuid: userGuid
            }
          })
          .then((results) => {
            const returnVal: ISiteAccess[] = [];
            results.forEach((result: any) => {
              const siteAccess: ISiteAccess = {
                siteGuid: result.siteGuid,
                userGuid: result.userGuid,
                roleId: result.roleId,
                level: result.access_control_role.level,
                role: result.access_control_role.name,
                siteName: result.site.siteName
              };
              returnVal.push(siteAccess);
            });
            resolve(returnVal);
            // resolve({
            //   siteGuid: results.siteGuid,
            //   siteName: results.siteName,
            //   roleId: results.access_control_user_role.roleId,
            //   userGuid: results.access_control_user_role.userGuid,
            //   level: results.access_control_user_role.access_control_role.level,
            //   name: results.access_control_user_role.access_control_role.name,
            // })
          })
          .catch((error) => {});
      });
    });
  }

  public static async updateSiteAccess(roleId: number, userGuid: string, siteGuid: string) {
    return new Promise((resolve, reject) => {
      const userRoles = DbManager.db.UserRolesAC;
      userRoles
        .update(
          {
            roleId: roleId
          },
          {
            where: {
              userGuid,
              siteGuid
            }
          }
        )
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
