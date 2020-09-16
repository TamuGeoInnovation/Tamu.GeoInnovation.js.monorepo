module.exports = {
  name: 'gisday-angular',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/gisday-angular',
  snapshotSerializers: ['jest-preset-angular/AngularSnapshotSerializer.js', 'jest-preset-angular/HTMLCommentSerializer.js']
};
