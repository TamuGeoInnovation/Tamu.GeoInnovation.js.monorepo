module.exports = {
  name: 'maps-feature-trip-planner',
  preset: '../../../../jest.config.js',
  coverageDirectory: '../../../../coverage/libs/maps/feature/trip-planner',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
