module.exports = {
  name: 'geoservices-angular',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/geoservices-angular',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
