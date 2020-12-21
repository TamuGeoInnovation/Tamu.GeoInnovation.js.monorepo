module.exports = {
  name: 'maps-esri',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/maps/esri',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
