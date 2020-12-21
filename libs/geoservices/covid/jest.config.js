module.exports = {
  name: 'geoservices-covid',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/geoservices/covid',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
