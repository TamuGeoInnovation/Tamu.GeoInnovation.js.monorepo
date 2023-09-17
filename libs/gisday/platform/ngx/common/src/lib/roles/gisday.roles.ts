/**
 * An enumeration of roles used by the GIS Day application.
 *
 * These roles are defined in the Auth0 dashboard and are injected into the ID token
 * to enable role-based authorization.
 */
export enum GISDayRoles {
  ADMIN = 'GIS Day Admin',
  MANAGER = 'GIS Day Manager',
  PROFESSOR = 'GIS Day Professor',
  PRESENTER = 'GIS Day PRESENTER',
  STUDENT = 'GIS Day Student',
  USER = 'GIS Day User'
}
