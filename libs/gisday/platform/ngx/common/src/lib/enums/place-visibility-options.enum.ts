export enum PlaceVisibilityOptions {
  Header = 'header',
  Footer = 'footer',
  OrgPage = 'org-page',
  /** The one opt-out: every organization is in the Sessions page's filter unless this is set (#1825). */
  HiddenFromSessionsFilter = 'hidden-sessions-filter'
}
