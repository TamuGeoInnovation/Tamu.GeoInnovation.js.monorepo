module.exports = {
  name: 'cpa-admin',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/cpa/admin',
  snapshotSerializers: ['jest-preset-angular/AngularSnapshotSerializer.js', 'jest-preset-angular/HTMLCommentSerializer.js']
};
