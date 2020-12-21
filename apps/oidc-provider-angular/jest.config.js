module.exports = {
  name: 'oidc-provider-angular',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/oidc-provider-angular',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
