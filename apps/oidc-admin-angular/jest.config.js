module.exports = {
  name: 'oidc-admin-angular',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/oidc-admin-angular',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
