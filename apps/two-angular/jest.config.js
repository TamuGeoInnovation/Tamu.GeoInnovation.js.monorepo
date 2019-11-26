module.exports = {
  name: 'two-angular',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/two-angular',
  snapshotSerializers: ['jest-preset-angular/AngularSnapshotSerializer.js', 'jest-preset-angular/HTMLCommentSerializer.js']
};
