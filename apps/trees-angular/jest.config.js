module.exports = {
  name: 'trees-angular',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/trees-angular',
  snapshotSerializers: ['jest-preset-angular/AngularSnapshotSerializer.js', 'jest-preset-angular/HTMLCommentSerializer.js']
};
