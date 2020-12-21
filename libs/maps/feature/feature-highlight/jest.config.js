module.exports = {
  name: 'maps-feature-feature-highlight',
  preset: '../../../../jest.config.js',
  coverageDirectory: '../../../../coverage/libs/maps/feature/feature-highlight',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
