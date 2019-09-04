module.exports = {
  name: 'dev-tools-responsive',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/dev-tools/responsive',
  snapshotSerializers: ['jest-preset-angular/AngularSnapshotSerializer.js', 'jest-preset-angular/HTMLCommentSerializer.js']
};
