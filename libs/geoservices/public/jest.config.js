module.exports = {
  name: 'geoservices-public',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/geoservices/public',
  snapshotSerializers: ['jest-preset-angular/AngularSnapshotSerializer.js', 'jest-preset-angular/HTMLCommentSerializer.js']
};
