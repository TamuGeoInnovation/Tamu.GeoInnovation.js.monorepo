module.exports = {
  name: 'ues-angular',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/ues-angular',
  snapshotSerializers: ['jest-preset-angular/AngularSnapshotSerializer.js', 'jest-preset-angular/HTMLCommentSerializer.js']
};
