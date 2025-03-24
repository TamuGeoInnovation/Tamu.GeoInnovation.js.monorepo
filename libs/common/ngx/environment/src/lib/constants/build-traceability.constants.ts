export const metadata = {
  buildDate: '___BUILD_DATE___',
  gitCommit: '___GIT_COMMIT___',
  gitTag: '___GIT_TAG___',
  containerName: '___CONTAINER_NAME___',
  nodeName: '___NODE_NAME___',
  environment: '___ENVIRONMENT_MODE___'
};

export interface ReleaseMetadata {
  buildDate: string;
  gitCommit: string;
  gitTag: string;
  containerName: string;
  nodeName: string;
  environment: string;
}
