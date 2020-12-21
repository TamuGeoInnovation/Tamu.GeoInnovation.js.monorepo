module.exports = {
  name: 'common-ngx-local-store',
  preset: '../../../../jest.config.js',
  coverageDirectory: '../../../../coverage/libs/common/ngx/local-store',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
