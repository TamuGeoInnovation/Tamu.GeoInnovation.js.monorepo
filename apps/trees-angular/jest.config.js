module.exports = {
  name: 'trees-angular',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/trees-angular',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
