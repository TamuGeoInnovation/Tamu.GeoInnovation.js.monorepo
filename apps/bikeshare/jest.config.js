module.exports = {
  name: 'angular-aggiemap-trees',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/angular-aggiemap-trees',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
