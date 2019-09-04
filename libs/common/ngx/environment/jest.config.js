module.exports = {
  name: 'common-ngx-environment',
  preset: '../../../../jest.config.js',
  coverageDirectory: '../../../../coverage/libs/common/ngx/environment',
  snapshotSerializers: ['jest-preset-angular/AngularSnapshotSerializer.js', 'jest-preset-angular/HTMLCommentSerializer.js']
};
