module.exports = {
  name: 'signage',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/signage',
  snapshotSerializers: ['jest-preset-angular/AngularSnapshotSerializer.js', 'jest-preset-angular/HTMLCommentSerializer.js']
};
