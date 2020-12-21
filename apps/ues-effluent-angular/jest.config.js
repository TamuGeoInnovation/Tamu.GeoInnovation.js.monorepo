module.exports = {
  name: 'ues-effluent-angular',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/ues-effluent-angular',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
