module.exports = {
  name: 'gisday-ngx',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/gisday/ngx',
  snapshotSerializers: ['jest-preset-angular/AngularSnapshotSerializer.js', 'jest-preset-angular/HTMLCommentSerializer.js']
};
