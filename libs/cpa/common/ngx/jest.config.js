module.exports = {
  name: 'cpa-common',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/cpa/common/ngx',
  snapshotSerializers: ['jest-preset-angular/AngularSnapshotSerializer.js', 'jest-preset-angular/HTMLCommentSerializer.js']
};
