module.exports = {
  name: 'cpa-common',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/cpa/common/ngx',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
