module.exports = {
  name: 'cpa-angular',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/cpa-angular',
  snapshotSerializers: ['jest-preset-angular/AngularSnapshotSerializer.js', 'jest-preset-angular/HTMLCommentSerializer.js']
};
