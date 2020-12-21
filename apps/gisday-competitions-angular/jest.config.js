module.exports = {
  name: 'gisday-competitions-angular',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/gisday-competitions-angular',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
