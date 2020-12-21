module.exports = {
  name: 'maps-feature-forms',
  preset: '../../../../jest.config.js',
  coverageDirectory: '../../../../coverage/libs/maps/feature/forms',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
