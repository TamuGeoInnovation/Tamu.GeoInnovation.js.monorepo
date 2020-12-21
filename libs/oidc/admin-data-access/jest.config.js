module.exports = {
  name: 'oidc-admin-data-access',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/oidc/admin-data-access',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
