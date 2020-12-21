module.exports = {
  name: 'cpa-angular',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/cpa-angular',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
