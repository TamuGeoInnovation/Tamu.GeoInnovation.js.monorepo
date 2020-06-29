module.exports = {
  name: 'geoservices-internal',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../../coverage/libs/geoservices/internal',
  snapshotSerializers: ['jest-preset-angular/AngularSnapshotSerializer.js', 'jest-preset-angular/HTMLCommentSerializer.js']
};
