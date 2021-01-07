module.exports = {
  name: 'gisday-common',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/gisday/common',
  snapshotSerializers: ['jest-preset-angular/AngularSnapshotSerializer.js', 'jest-preset-angular/HTMLCommentSerializer.js']
};
