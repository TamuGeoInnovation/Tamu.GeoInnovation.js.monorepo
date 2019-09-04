module.exports = {
  name: 'dev-tools-application-testing',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/dev-tools/application-testing',
  snapshotSerializers: ['jest-preset-angular/AngularSnapshotSerializer.js', 'jest-preset-angular/HTMLCommentSerializer.js']
};
