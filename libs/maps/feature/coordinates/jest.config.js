module.exports = {
  name: 'maps-feature-coordinates',
  preset: '../../../../jest.config.js',
  coverageDirectory: '../../../../coverage/libs/maps/feature/coordinates',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
