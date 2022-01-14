export enum ROLES {
  ADMIN = 'ADMIN',
  PUBLISHER = 'PUBLISHER',
  USER = 'USER'
}

export type Roles = keyof typeof ROLES;

export interface IUser {
  name: string;
  family_name: string;
  given_name: string;
  picture: string;
  email: string;
  claims: {
    name: string;
    family_name: string;
    given_name: string;
    picture: string;
    email: string;
    groups?: Array<Roles>;
  };
}

export interface ClientRoles {
  [roleId: string]: string;
}
