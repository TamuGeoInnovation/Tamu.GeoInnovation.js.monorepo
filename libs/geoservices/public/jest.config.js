module.exports = {
  name: 'geoservices-public',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/geoservices/public',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
