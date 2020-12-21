module.exports = {
  name: 'common-ngx-environment',
  preset: '../../../../jest.config.js',
  coverageDirectory: '../../../../coverage/libs/common/ngx/environment',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
