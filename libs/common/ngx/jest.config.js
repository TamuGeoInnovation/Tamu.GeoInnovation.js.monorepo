module.exports = {
  name: 'common-ngx',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/common/ngx',
  snapshotSerializers: ['jest-preset-angular/AngularSnapshotSerializer.js', 'jest-preset-angular/HTMLCommentSerializer.js']
};
