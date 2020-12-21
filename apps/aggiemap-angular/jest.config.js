module.exports = {
  name: 'aggiemap-angular',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/aggiemap-angular',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
