module.exports = {
  name: 'dev-tools-application-testing',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/dev-tools/application-testing',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
