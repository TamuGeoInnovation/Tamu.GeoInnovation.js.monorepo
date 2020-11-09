module.exports = {
  name: 'cpa-public',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/cpa/public',
  snapshotSerializers: ['jest-preset-angular/AngularSnapshotSerializer.js', 'jest-preset-angular/HTMLCommentSerializer.js']
};
