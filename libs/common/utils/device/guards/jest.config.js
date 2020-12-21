module.exports = {
  name: 'common-utils-device-guards',
  preset: '../../../../../jest.config.js',
  coverageDirectory: '../../../../../coverage/libs/common/utils/device/guards',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
