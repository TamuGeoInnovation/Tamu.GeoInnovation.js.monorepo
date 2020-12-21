module.exports = {
  name: 'geoservices-internal',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../../coverage/libs/geoservices/internal',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
