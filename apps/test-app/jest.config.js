module.exports = {
  name: 'test-app',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/test-app',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
