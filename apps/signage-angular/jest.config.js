module.exports = {
  name: 'signage-angular',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/signage-angular',
  snapshotSerializers: ['jest-preset-angular/AngularSnapshotSerializer.js', 'jest-preset-angular/HTMLCommentSerializer.js']
};
