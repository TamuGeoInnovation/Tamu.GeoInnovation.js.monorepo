module.exports = {
  name: 'ues-common-ngx',
  preset: '../../../../jest.config.js',
  coverageDirectory: '../../../../coverage/libs/ues/common/ngx',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
