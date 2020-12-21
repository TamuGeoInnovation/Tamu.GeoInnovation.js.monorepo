module.exports = {
  name: 'dev-tools-responsive',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/dev-tools/responsive',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
