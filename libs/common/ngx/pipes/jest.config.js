module.exports = {
  name: 'common-ngx-pipes',
  preset: '../../../../jest.config.js',
  coverageDirectory: '../../../../coverage/libs/common/ngx/pipes',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
