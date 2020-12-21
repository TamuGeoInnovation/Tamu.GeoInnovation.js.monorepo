module.exports = {
  name: 'common-ngx-router',
  preset: '../../../../jest.config.js',
  coverageDirectory: '../../../../coverage/libs/common/ngx/router',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
