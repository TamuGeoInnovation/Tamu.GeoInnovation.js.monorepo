module.exports = {
  name: 'maps-feature-accessibility',
  preset: '../../../../jest.config.js',
  coverageDirectory: '../../../../coverage/libs/maps/feature/accessibility',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
