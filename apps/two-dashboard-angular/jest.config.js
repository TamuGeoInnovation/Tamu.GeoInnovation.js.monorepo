module.exports = {
  name: 'two-dashboard-angular',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/two-dashboard-angular',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
